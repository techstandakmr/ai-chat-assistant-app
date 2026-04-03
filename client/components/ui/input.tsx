import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

type InputProps = {
    placeholder: string;
    value?: string;
    defaultValue?: string;
    onChangeText?: (text: string) => void;
    secureTextEntry?: boolean;
};

export default function Input({
    placeholder,
    value,
    defaultValue,
    onChangeText,
    secureTextEntry = false,
}: InputProps) {

    const [hide, setHide] = useState(secureTextEntry);

    return (
        <ThemedView style={styles.container}>
            <View style={styles.inputRow}>
                <TextInput
                    placeholder={placeholder}
                    style={styles.input}
                    value={value}
                    defaultValue={defaultValue}
                    onChangeText={onChangeText}
                    secureTextEntry={hide}
                    placeholderTextColor={Colors.dark.placeholder}
                />

                {/* eye icon */}
                {secureTextEntry && (
                    <TouchableOpacity onPress={() => setHide(!hide)} style={styles.eyeBtn}>
                        <Ionicons
                            name={hide ? "eye-off-outline" : "eye-outline"}
                            size={22}
                            color={Colors.dark.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.dark.input,
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
    },

    inputRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    input: {
        flex: 1,
        height: 50,
        fontSize: 15,
         color: Colors.dark.surface,
    },

    eyeBtn: {
        paddingLeft: 10,
    },
});
