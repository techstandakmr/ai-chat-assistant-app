import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { Button, Input } from "@/components/ui/";
import { Colors } from "@/constants/theme";
import { useUser } from "../../context/UserContext";
import { updateUserAPI } from "../../services/user.api";
import { validateName, validateEmail } from "@/utils/formValidators";
import Toast from 'react-native-toast-message';
import { showError, showInfo, showSuccess } from "@/utils/toast";
import Loader from "@/components/Loader";
import { useNetwork } from "@/context/NetworkContext";

export default function EditProfile() {
    const { isConnected } = useNetwork();
    const router = useRouter();
    const { user, setUser } = useUser();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        name: "",
        email: "",
    });

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
        }
    }, [user]);

    // Validate on each keystroke and update field-level error
    const handleNameChange = (value: string) => {
        setName(value);
        const res = validateName(value);
        setErrors(prev => ({ ...prev, name: res.error || "" }));
    };
    const handleEmailChange = (value: string) => {
        setEmail(value);
        const res = validateEmail(value);
        setErrors(prev => ({ ...prev, email: res.error || "" }));
    };

    const handleUpdate = async () => {
        if (!isConnected) {
            showError("Please check your connection");
            return;
        }

        const nameChanged = name !== user?.name;
        const emailChanged = email !== user?.email;

        // Skip API call if nothing changed
        if (!nameChanged && !emailChanged) {
            showInfo("Nothing to update");
            return;
        }

        // Validate only changed fields to avoid false errors on untouched ones
        const nameVal = nameChanged ? validateName(name) : { isValid: true, error: "" };
        const emailVal = emailChanged ? validateEmail(email) : { isValid: true, error: "" };
        if (!nameVal.isValid || !emailVal.isValid) {
            setErrors({
                name: nameVal.error || "",
                email: emailVal.error || "",
            });
            return;
        }

        try {
            setLoading(true);

            // Only send changed fields in the payload
            const payload: any = { userID: user?.id };
            if (nameChanged) payload.name = name;
            if (emailChanged) payload.email = email;

            const res = await updateUserAPI(payload);
            const updatedUser = res.data.user;
            setUser(updatedUser); // Sync updated profile into global context
            showSuccess("Profile updated successfully");
            router.back();
        } catch (err: any) {
            showError(
                err.response?.data?.message || "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Loader visible={loading} message="Saving changes..." />
            <SafeAreaView style={styles.container}>
                <ThemedText style={{
                    fontSize: 28, fontWeight: "700", marginBottom: 8, textAlign: "center"
                }}>
                    Profile Update
                </ThemedText>
                <ThemedText style={{ color: Colors.dark.textSecondary, marginBottom: 32, textAlign: "center" }}>
                    Update your profile information below
                </ThemedText>

                {/* Name field */}
                <Input
                    placeholder="Full Name"
                    value={name}
                    onChangeText={handleNameChange}
                />
                {!!errors.name && (
                    <ThemedText style={styles.error}>{errors.name}</ThemedText>
                )}

                {/* Email field */}
                <Input
                    placeholder="Email"
                    value={email}
                    onChangeText={handleEmailChange}
                />
                {!!errors.email && (
                    <ThemedText style={styles.error}>{errors.email}</ThemedText>
                )}

                {/* Cancel discards changes, Save triggers the update */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
                        <ThemedText style={styles.cancelText}>Cancel</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
                        <ThemedText style={styles.saveText}>Save Changes</ThemedText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
            <Toast />
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: "center"
    },
    error: {
        color: "red",
        fontSize: 12,
        marginBottom: 10,
    },
    actionRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 4,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 13,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.dark.border ?? "#3a3a3c",
        alignItems: "center",
    },
    cancelText: {
        fontWeight: "600",
        fontSize: 15,
        color: Colors.dark.textSecondary,
    },
    saveBtn: {
        flex: 2,
        paddingVertical: 13,
        borderRadius: 12,
        backgroundColor: Colors.dark.primary,
        alignItems: "center",
    },
    saveText: {
        fontWeight: "600",
        fontSize: 15,
        color: "#fff",
    },
});