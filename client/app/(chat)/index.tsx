import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Input, Sidebar } from "@/components/ui/";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Animated, StyleSheet, TouchableOpacity, View, ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { sendChatAPI } from "@/services/chat.api";
import { getConversationsAPI } from "@/services/conversation.api"
import { useChat } from "@/context/ChatContext";
import { useUser } from "@/context/UserContext";
import Toast from 'react-native-toast-message';
import { showError } from "@/utils/toast";
import Loader from "@/components/Loader";
import { useNetwork } from "@/context/NetworkContext";

export default function ChatHome() {
    const { isConnected } = useNetwork();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const { setOpenedConversationID, addChats, conversations, setConversations } = useChat();
    const { user } = useUser();
    const [loadingConversations, setLoadingConversations] = useState(false);
    const [text, setText] = useState("");
    const [openSidebar, setOpenSidebar] = useState(false);
    // Sidebar slides in/out from -260 (hidden) to 0 (visible)
    const sidebarX = useState(new Animated.Value(-260))[0];

    // Toggle sidebar
    const toggleSidebar = async () => {
        if (openSidebar) {
            Animated.timing(sidebarX, {
                toValue: -260,
                duration: 250,
                useNativeDriver: true,
            }).start(() => setOpenSidebar(false)); 
        } else {
            setOpenSidebar(true); 
            Animated.timing(sidebarX, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    };

    const handleStartChat = async () => {
        if (!isConnected) {
            showError("Please check your connection");
            return;
        }
        setLoadingConversations(true)
        if (!text.trim()) return;
        if (!user?.id) {
            setLoadingConversations(false);
            return showError("User not found");
        }

        try {
            const res = await sendChatAPI({
                chatID: Date.now().toString(),
                text,
                role: "user",
                userID: user?.id,
                actionTime: new Date().toISOString(),
                conversationID: undefined, // undefined signals the backend to create a new conversation
                repliedToChatID: null,
            });

            const chats = res.data?.chats; // backend returns both user message and AI reply
            if (!chats?.length) {
                throw new Error("No chat returned");
            }

            // Extract conversationID from the first message to set as the active conversation
            const conversationID = chats[0]?.conversationID;
            setOpenedConversationID(conversationID);
            addChats(chats);

            // Refresh conversation list so the new one appears in the sidebar
            const convRes = await getConversationsAPI({ userID: user?.id });
            setConversations(convRes.data);

            setLoadingConversations(false);
            setText("");
            router.push("/(chat)/chatBox"); // Navigate to full chat view with the new conversation open
        } catch (e: any) {
            setLoadingConversations(false);
            console.error("Start chat error:", e);
            showError(e.response?.data?.message || "Failed to start chat");
        }
    };

    return (
        <>
            <Loader visible={loadingConversations} message="Loading your chats..." />
            <SafeAreaView style={styles.safe}>
                {/* Sidebar */}
                <Sidebar
                    open={openSidebar}
                    sidebarX={sidebarX}
                    history={conversations}
                    onClose={toggleSidebar}
                />

                {/* Header */}
                <ThemedView style={styles.header}>
                    <TouchableOpacity style={styles.sidebarBtn} onPress={toggleSidebar}>
                        <Ionicons name="menu-outline" size={28} color={
                            colorScheme === "dark" ? Colors.dark.text : Colors.light.text
                        } />
                    </TouchableOpacity>

                    {/* Avatar — shows profile picture or first letter of name as fallback */}
                    <TouchableOpacity style={styles.avatar} onPress={() => router.push("/(profile)")}>
                        {user?.profilePicURL ? (
                            <Image
                                source={{ uri: user.profilePicURL }}
                                style={{ width: 40, height: 40, borderRadius: 20 }}
                            />
                        ) : (
                            <ThemedText style={styles.avatarText}>
                                {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
                            </ThemedText>
                        )}
                    </TouchableOpacity>
                </ThemedView>

                {/* Shifts content up when keyboard opens — behavior differs per platform */}
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    {/* keyboardShouldPersistTaps="handled" lets the send button work while keyboard is open */}
                    <ScrollView
                        contentContainerStyle={styles.centerContainer}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <ThemedView style={styles.startBox}>
                            <ThemedText style={styles.startTitle}>Start a new chat</ThemedText>
                            <ThemedView style={styles.inputRow}>
                                <View style={{ flex: 1 }}>
                                    <Input
                                        placeholder="Ask me anything..."
                                        value={text}
                                        onChangeText={setText}
                                    />
                                </View>
                                {/* Send button only appears when there is text */}
                                {text && (
                                    <TouchableOpacity style={styles.sendBtn} onPress={handleStartChat}>
                                        <Ionicons name="send" size={20} color="#fff" />
                                    </TouchableOpacity>
                                )}
                            </ThemedView>
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
    },
    sidebar: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 260,
        paddingTop: 60,
        paddingHorizontal: 16,
        zIndex: 10,
    },
    sidebarTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 16,
    },
    sidebarItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 10,
    },
    sidebarText: {
        fontSize: 14,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "transparent",
    },
    sidebarBtn: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.dark.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "#fff",
        fontWeight: "700",
    },
    centerContainer: {
        flexGrow: 1,         
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    startBox: {
        gap: 14,
        backgroundColor: "transparent"
    },
    startTitle: {
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 10,
    },
    inputRow: {
        flexDirection: "row",
        gap: 10,
        backgroundColor: "transparent",
    },
    sendBtn: {
        width: 50,
        height: 50,
        borderRadius: 14,
        backgroundColor: Colors.dark.primary,
        justifyContent: "center",
        alignItems: "center",
    },
});