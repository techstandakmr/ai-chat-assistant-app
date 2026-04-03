import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Input } from "@/components/ui";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { updateUserAPI } from "../../services/user.api";
import { useUser } from "../../context/UserContext";
import { validatePassword } from "@/utils/formValidators";
import Toast from 'react-native-toast-message';
import { showError, showSuccess } from "@/utils/toast";
import Loader from "@/components/Loader";
import { useAuth } from "@/context/AuthContext";
import { useNetwork } from "@/context/NetworkContext";

export default function UpdatePassword() {
  const { isConnected } = useNetwork();
  const { logout } = useAuth(); // Force re-login after password change for security
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { user } = useUser();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
  });

  // Validate on each keystroke and update field-level error
  const handleOldPasswordChange = (value: string) => {
    setOldPassword(value);
    const res = validatePassword(value);
    setErrors(prev => ({ ...prev, oldPassword: res.error || "" }));
  };
  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    const res = validatePassword(value);
    setErrors(prev => ({ ...prev, newPassword: res.error || "" }));
  };

  const handleUpdatePassword = async () => {
    if (!isConnected) {
      showError("Please check your connection");
      return;
    }

    // Validate both fields before hitting the API
    const oldVal = validatePassword(oldPassword);
    const newVal = validatePassword(newPassword);
    if (!oldVal.isValid || !newVal.isValid) {
      setErrors(prev => ({
        ...prev,
        oldPassword: oldVal.error || "",
        newPassword: newVal.error || "",
      }));
      return;
    }

    try {
      setLoading(true);
      // updateByOTP: false — uses old password for auth instead of OTP flow
      await updateUserAPI({
        userID: user?.id,
        password: newPassword,
        oldPassword,
        updateByOTP: false
      });
      showSuccess("Password updated successfully");
      await logout();       // Invalidate session
      router.dismissAll();  // Clear navigation stack back to login
    } catch (err: any) {
      showError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Loader visible={loading} message="Saving changes..." />
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
          <ThemedText style={styles.title}>Update Password</ThemedText>
        </ThemedView>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <ThemedView style={{ backgroundColor: "transparent" }}>
              <Input
                placeholder="Old Password"
                secureTextEntry
                value={oldPassword}
                onChangeText={handleOldPasswordChange}
              />
              {!!errors.oldPassword && (
                <ThemedText style={styles.error}>{errors.oldPassword}</ThemedText>
              )}

              <Input
                placeholder="New Password"
                secureTextEntry
                value={newPassword}
                onChangeText={handleNewPasswordChange}
              />
              {!!errors.newPassword && (
                <ThemedText style={styles.error}>{errors.newPassword}</ThemedText>
              )}

              {/* Redirect to OTP-based reset if user doesn't know their current password */}
              <TouchableOpacity onPress={() => router.push("/(profile)/forgot-password")}>
                <ThemedText style={styles.linkText}>Forgot password?</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={handleUpdatePassword}>
                <ThemedText style={styles.btnText}>Update Password</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ScrollView>
        </KeyboardAvoidingView>
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
  linkText: {
    textAlign: "right",
    color: Colors.dark.primary,
    fontWeight: "600",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
  actionBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.dark.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});