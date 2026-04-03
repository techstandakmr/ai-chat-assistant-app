import { ThemedText } from "@/components/themed-text";
import { Button, Input } from "@/components/ui/";
import { Colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import {
    TouchableOpacity,
    StyleSheet,
    Image,
    View,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import {
    validateEmail,
    validatePassword
} from "@/utils/formValidators";
import Toast from "react-native-toast-message";
import { showError, showSuccess } from "@/utils/toast";
import { loginAPI } from "@/services/auth.api";
import { getConversationsAPI } from "@/services/conversation.api";
import { useChat } from "@/context/ChatContext";
import Loader from "@/components/Loader";
import { useNetwork } from "@/context/NetworkContext";

export default function Login() {
    const { login } = useAuth();        
    const { setUser } = useUser();      
    const { setConversations } = useChat(); 
    const router = useRouter();
    const { isConnected } = useNetwork(); // Network status from context

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        email: "",
        password: "",
    });

    // Validate on every keystroke so errors appear inline as user types
    const handleEmailChange = (value: string) => {
        setEmail(value);
        const res = validateEmail(value);
        setErrors(prev => ({ ...prev, email: res.error || "" }));
    };

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        const res = validatePassword(value);
        setErrors(prev => ({ ...prev, password: res.error || "" }));
    };

    const handleLogin = async () => {
        // Block API call immediately if device is offline
        if (!isConnected) {
            showError("Please check your connection");
            return;
        }

        // Final validation pass before submitting — catches untouched empty fields
        const emailVal = validateEmail(email);
        const passVal = validatePassword(password);
        if (!emailVal.isValid || !passVal.isValid) {
            setErrors({
                email: emailVal.error || "",
                password: passVal.error || "",
            });
            return;
        }

        try {
            setLoading(true);
            const res = await loginAPI({ email, password });
            const { token, user } = res.data;

            // Save token to secure storage via AuthContext
            if (token) await login(token);
            setUser(user);

            // Fetch and cache conversations right after login so the chat screen loads instantly
            const conversationsList = await getConversationsAPI({
                userID: user?.id
            });
            setConversations(conversationsList?.data);

            showSuccess("Login successful");
            router.replace("/(chat)"); // replace instead of push so user can't go back to login
        } catch (err: any) {
            showError(
                err?.response?.data?.message || "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Full-screen overlay shown during API call */}
            <Loader visible={loading} message="Logging in..." />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Shifts content up when keyboard opens — behavior differs per platform */}
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    {/* keyboardShouldPersistTaps="handled" lets buttons work while keyboard is open */}
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.header}>
                            <Image
                                source={{
                                    uri: "https://res.cloudinary.com/dn0hsbnpl/image/upload/v1774775562/ai_chat_assistant/ppn2qptvcmbn6vy7ybrf.png"
                                }}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                            <ThemedText style={styles.title}>Welcome Back</ThemedText>
                            <ThemedText style={styles.subtitle}>
                                Login to continue chatting with AI
                            </ThemedText>
                        </View>

                        {/* Email */}
                        <Input
                            placeholder="Email"
                            value={email}
                            onChangeText={handleEmailChange}
                        />
                        {!!errors.email && (
                            <ThemedText style={styles.error}>{errors.email}</ThemedText>
                        )}

                        {/* Password */}
                        <Input
                            placeholder="Password"
                            secureTextEntry
                            value={password}
                            onChangeText={handlePasswordChange}
                        />
                        {!!errors.password && (
                            <ThemedText style={styles.error}>{errors.password}</ThemedText>
                        )}

                        <Button
                            title={"Login"}
                            onPress={handleLogin}
                        />

                        <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                            <ThemedText style={styles.linkText}>
                                Don't have an account?{" "}
                                <ThemedText style={styles.link}>Sign Up</ThemedText>
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.push("/(profile)/forgot-password")}>
                            <ThemedText style={styles.linkText}>
                                Forgot {" "}
                                <ThemedText style={styles.link}>Password?</ThemedText>
                            </ThemedText>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
            <Toast />
        </>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,          
        justifyContent: "center",
        padding: 24,
    },
    header: {
        alignItems: "center",
        marginBottom: 32,
    },
    logo: {
        width: 180,
        height: 180,
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        textAlign: "center",
    },
    subtitle: {
        color: Colors.dark.textSecondary,
        textAlign: "center",
        marginTop: 6,
    },
    error: { color: "red", fontSize: 12, marginBottom: 10, marginLeft: 4 },
    linkText: { color: Colors.dark.textSecondary, textAlign: "center" },
    link: { color: Colors.dark.primary, fontWeight: "600" },
});