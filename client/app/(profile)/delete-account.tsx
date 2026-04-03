import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Input } from "@/components/ui";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { deleteAccountAPI } from "@/services/user.api";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import { validateEmail, validatePassword } from "@/utils/formValidators";
import Toast from 'react-native-toast-message';
import { showError, showSuccess } from "@/utils/toast";
import Loader from "@/components/Loader";
import { useNetwork } from "@/context/NetworkContext";

export default function DeleteAccount() {
    const { isConnected } = useNetwork();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const { logout } = useAuth();
    const { clearUser, user } = useUser(); // clearUser wipes local profile state after deletion

    // Credentials required to confirm identity before deletion
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        email: "",
        password: "",
    });

    // Validate on each keystroke and show inline error
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

    const handleDelete = async () => {
        if (!isConnected) {
            showError("Please check your connection");
            return;
        }

        // Validate both fields before showing the confirmation dialog
        const emailVal = validateEmail(email);
        const passVal = validatePassword(password);
        if (!emailVal.isValid || !passVal.isValid) {
            setErrors({
                email: emailVal.error || "",
                password: passVal.error || "",
            });
            return;
        }

        // Final confirmation — destructive action requires explicit user approval
        Alert.alert(
            "Confirm Delete",
            "This will permanently delete your account. This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await deleteAccountAPI({
                                userID: user?.id,
                                email,
                                password
                            });
                            showSuccess("Your account has been deleted");
                            clearUser();   // Wipe user from context
                            await logout(); // Clear token
                            setLoading(true);
                            router.dismissAll(); // Clear navigation stack
                        } catch (err: any) {
                            showError(
                                err.response?.data?.message || "Something went wrong"
                            );
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <>
            <Loader visible={loading} message="Deleting account..." />
            <SafeAreaView style={styles.safe}>
                {/* Header */}
                <ThemedView style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons
                            name="arrow-back"
                            size={22}
                            color={colorScheme === "dark" ? Colors.dark.text : Colors.light.text}
                        />
                    </TouchableOpacity>
                    <ThemedText style={styles.title}>Delete Account</ThemedText>
                </ThemedView>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <ThemedView style={{ backgroundColor: "transparent" }}>
                        <ThemedText style={styles.warningText}>
                            ⚠ This action is permanent and cannot be undone.
                        </ThemedText>

                        {/* Identity verification fields */}
                        <Input
                            placeholder="Email"
                            value={email}
                            onChangeText={handleEmailChange}
                        />
                        {!!errors.email && (
                            <ThemedText style={styles.error}>{errors.email}</ThemedText>
                        )}
                        <Input
                            placeholder="Password"
                            secureTextEntry
                            value={password}
                            onChangeText={handlePasswordChange}
                        />
                        {!!errors.password && (
                            <ThemedText style={styles.error}>{errors.password}</ThemedText>
                        )}

                        {/* Escape hatch if user doesn't remember their password */}
                        <TouchableOpacity onPress={() => router.push("/(profile)/update-password")}>
                            <ThemedText style={styles.linkText}>Forgot password?</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={handleDelete}
                        >
                            <ThemedText style={styles.deleteText}>
                                Delete My Account
                            </ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </ScrollView>
            </SafeAreaView>
            <Toast />
        </>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        paddingHorizontal: 18,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginTop: 8,
        marginBottom: 18,
        backgroundColor: "transparent",
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
    },
    warningText: {
        color: "#E53935",
        fontWeight: "600",
        fontSize: 13,
        marginBottom: 6,
        textAlign: "center"
    },
    error: {
        color: "red",
        fontSize: 12,
        marginBottom: 10,
    },
    linkText: {
        textAlign: "right",
        color: Colors.dark.primary,
        fontWeight: "600",
    },
    deleteBtn: {
        height: 52,
        borderRadius: 14,
        backgroundColor: "#E53935",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    deleteText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
});