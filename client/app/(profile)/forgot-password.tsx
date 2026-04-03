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
import { sendOTPAPI, verifyOTPAPI, updateUserAPI } from "../../services/user.api";
import { useUser } from "../../context/UserContext";
import { validatePassword, validateOTP, validateEmail } from "@/utils/formValidators";
import Toast from 'react-native-toast-message';
import { showError, showInfo, showSuccess } from "@/utils/toast";
import Loader from "@/components/Loader";
import { useAuth } from "@/context/AuthContext";
import { useNetwork } from "@/context/NetworkContext";

export default function ForgotPassword() {
    const { isConnected } = useNetwork();
    const { logout } = useAuth(); 
    const router = useRouter();
    const colorScheme = useColorScheme();
    const { user } = useUser();

    // Pre-fill email if user is already logged in
    const [email, setEmail] = useState(user?.email);
    const [otp, setOtp] = useState("");
    const [resetPassword, setResetPassword] = useState("");

    // Controls which step of the 3-step flow is rendered
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);

    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState(""); // Dynamic message shown in loader
    const [errors, setErrors] = useState({
        email: "",
        otp: "",
        resetPassword: "",
    });

    // Validate on each keystroke and update field-level error
    const handleEmailChange = (value: string) => {
        setEmail(value);
        const res = validateEmail(value);
        setErrors(prev => ({ ...prev, email: res.error || "" }));
    };
    const handleOtpChange = (value: string) => {
        setOtp(value);
        const res = validateOTP(value);
        setErrors(prev => ({ ...prev, otp: res.error || "" }));
    };
    const handleResetPasswordChange = (value: string) => {
        setResetPassword(value);
        const res = validatePassword(value);
        setErrors(prev => ({ ...prev, resetPassword: res.error || "" }));
    };

    // Step 1 — request OTP to be emailed
    const handleSendOTP = async () => {
        if (!isConnected) {
            showError("Please check your connection");
            return;
        }
        const emailVal = validateEmail(email);
        if (!emailVal.isValid) {
            setErrors(prev => ({ ...prev, email: emailVal.error || "" }));
            return;
        }
        try {
            setLoading(true);
            setLoadingText("Sending OTP...");
            await sendOTPAPI({ email });
            setOtpSent(true);
            setLoadingText("");
            showInfo("Check your email for OTP");
        } catch (err: any) {
            showError(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
            setLoadingText("");
        }
    };

    // Step 2 — verify the OTP entered by the user
    const handleVerifyOTP = async () => {
        if (!isConnected) {
            showError("Please check your connection");
            return;
        }
        const otpVal = validateOTP(otp);
        if (!otpVal.isValid) {
            setErrors(prev => ({ ...prev, otp: otpVal.error || "" }));
            return;
        }
        try {
            setLoading(true);
            setLoadingText("Verifying OTP...");
            await verifyOTPAPI({ email, code: otp });
            setLoading(false);
            setLoadingText("");
            setOtpVerified(true); // Unlocks step 3
            showSuccess("OTP verified");
        } catch (err: any) {
            showError(err.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    // Step 3 — save the new password and log the user out
    const handleResetPassword = async () => {
        if (!isConnected) {
            showError("Please check your connection");
            return;
        }
        const passVal = validatePassword(resetPassword);
        if (!passVal.isValid) {
            setErrors(prev => ({ ...prev, resetPassword: passVal.error || "" }));
            return;
        }
        try {
            setLoading(true);
            setLoadingText("Saving changes...");
            // updateByOTP flag tells the API to skip current-password check
            await updateUserAPI({
                email,
                password: resetPassword,
                updateByOTP: true
            });
            showSuccess("Password reset successful");
            await logout();
            router.dismissAll();
        } catch (err: any) {
            showError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Loader visible={loading} message={loadingText} />
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
                    <ThemedText style={styles.title}>Forgot Password</ThemedText>
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

                            {/* Step 1 — Email input + Send OTP (skips email field if already known) */}
                            {!otpSent && (
                                <>
                                    {!user?.email && <>
                                        <Input
                                            placeholder="Enter OTP"
                                            value={email}
                                            onChangeText={handleEmailChange}
                                        />
                                        {!!errors.email && (
                                            <ThemedText style={styles.error}>{errors.email}</ThemedText>
                                        )}
                                    </>}
                                    <ThemedText style={styles.infoText}>
                                        An OTP will be sent to your registered email to reset your password.
                                    </ThemedText>
                                    <TouchableOpacity style={styles.actionBtn} onPress={handleSendOTP}>
                                        <ThemedText style={styles.btnText}>Send OTP</ThemedText>
                                    </TouchableOpacity>
                                </>
                            )}

                            {/* Step 2 — OTP entry + Verify */}
                            {otpSent && !otpVerified && (
                                <>
                                    <Input
                                        placeholder="Enter OTP"
                                        value={otp}
                                        onChangeText={handleOtpChange}
                                    />
                                    {!!errors.otp && (
                                        <ThemedText style={styles.error}>{errors.otp}</ThemedText>
                                    )}
                                    <TouchableOpacity style={styles.actionBtn} onPress={handleVerifyOTP}>
                                        <ThemedText style={styles.btnText}>Verify OTP</ThemedText>
                                    </TouchableOpacity>
                                </>
                            )}

                            {/* Step 3 — New password input + Reset */}
                            {otpVerified && (
                                <>
                                    <Input
                                        placeholder="New Password"
                                        secureTextEntry
                                        value={resetPassword}
                                        onChangeText={handleResetPasswordChange}
                                    />
                                    {!!errors.resetPassword && (
                                        <ThemedText style={styles.error}>{errors.resetPassword}</ThemedText>
                                    )}
                                    <TouchableOpacity style={styles.actionBtn} onPress={handleResetPassword}>
                                        <ThemedText style={styles.btnText}>Reset Password</ThemedText>
                                    </TouchableOpacity>
                                </>
                            )}

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
        marginTop: 14,
    },
    infoText: {
        textAlign: "center",
        color: Colors.dark.textSecondary,
        marginBottom: 8,
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