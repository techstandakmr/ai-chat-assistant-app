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
import { signupAPI } from "@/services/auth.api";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import {
  validateEmail,
  validatePassword,
  validateName,
} from "@/utils/formValidators";
import Toast from "react-native-toast-message";
import { showError, showSuccess } from "@/utils/toast";
import Loader from "@/components/Loader";
import { useNetwork } from "@/context/NetworkContext";

export default function Signup() {
  const router = useRouter();
  const { login } = useAuth();    // Persists JWT after successful signup
  const { setUser } = useUser();  // Stores user profile globally
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });
  const { isConnected } = useNetwork();

  // Validate on every keystroke so errors appear inline as user types
  const handleNameChange = (value: string) => {
    setName(value);
    const res = validateName(value);
    setErrors((prev) => ({ ...prev, name: res.error || "" }));
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    const res = validateEmail(value);
    setErrors((prev) => ({ ...prev, email: res.error || "" }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const res = validatePassword(value);
    setErrors((prev) => ({ ...prev, password: res.error || "" }));
  };

  const handleSignup = async () => {
    // Block API call immediately if device is offline
    if (!isConnected) {
      showError("Please check your connection");
      return;
    }

    // Final validation pass before submitting — catches untouched empty fields
    const nameVal = validateName(name);
    const emailVal = validateEmail(email);
    const passVal = validatePassword(password);
    if (!nameVal.isValid || !emailVal.isValid || !passVal.isValid) {
      setErrors({
        name: nameVal.error || "",
        email: emailVal.error || "",
        password: passVal.error || "",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await signupAPI({ name, email, password });
      const { token, user } = res.data;

      // Auto-login immediately after signup — no need for a separate login step
      await login(token);
      setUser(user);

      showSuccess("Signup successful");
      router.replace("/(chat)"); // replace instead of push so user can't navigate back to signup
    } catch (err: any) {
      showError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Full-screen overlay shown during API call */}
      <Loader visible={loading} message="Creating account..." />

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
                  uri: "https://res.cloudinary.com/dn0hsbnpl/image/upload/v1774775562/ai_chat_assistant/ppn2qptvcmbn6vy7ybrf.png",
                }}
                style={styles.logo}
                resizeMode="contain"
              />
              <ThemedText style={styles.title}>Create Account</ThemedText>
              <ThemedText style={styles.subtitle}>
                Join your personal AI assistant
              </ThemedText>
            </View>

            <Input
              placeholder="Full Name"
              value={name}
              onChangeText={handleNameChange}
            />
            {!!errors.name && (
              <ThemedText style={styles.error}>{errors.name}</ThemedText>
            )}

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

            <Button
              title={"Sign Up"}
              onPress={handleSignup}
            />

            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <ThemedText
                style={{ color: Colors.dark.textSecondary, textAlign: "center" }}
              >
                Already have an account?{" "}
                <ThemedText
                  style={{ color: Colors.dark.primary, fontWeight: "600" }}
                >
                  Login
                </ThemedText>
              </ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Toast rendered outside SafeAreaView so it overlays everything */}
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
    width: 150,
    height: 150,
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
});