import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Input, Sidebar } from "@/components/ui/";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useChat } from "@/context/ChatContext";
import { useUser } from "@/context/UserContext";
import { sendChatAPI, getChatsAPI } from "@/services/chat.api";
import Loader from "@/components/Loader";
import { showError } from "@/utils/toast";
import Markdown from "react-native-markdown-display";
import { useNetwork } from "@/context/NetworkContext";

export default function ChatBox() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const { openedConversationID, conversations, setConversations, chats, clearChats, addChats } = useChat();
    const { user } = useUser();
    const [openSidebar, setOpenSidebar] = useState(false);
    // Sidebar slides in/out from -260 (hidden) to 0 (visible)
    const sidebarX = useState(new Animated.Value(-260))[0];
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);   
    const [sending, setSending] = useState(false);  
    const [typing, setTyping] = useState(false);    
    const flatListRef = useRef<FlatList>(null);
    const { isConnected } = useNetwork();

    // Reload chat history whenever the user switches to a different conversation
    useEffect(() => {
        const loadChats = async () => {
            if (!isConnected) {
                showError("Please check your connection");
                return;
            }
            try {
                setLoading(true);
                clearChats(); // Clear previous conversation's messages before loading new ones
                const res = await getChatsAPI(openedConversationID!);
                addChats(res.data || []);
            } catch (err: any) {
                showError(err.response?.data?.message);
            } finally {
                setLoading(false);
            }
        };
        if (openedConversationID!) loadChats();
    }, [openedConversationID!]);

    // Scroll to the latest message whenever chats update
    useEffect(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [chats]);

    const handleSend = async () => {
        if (!isConnected) {
            showError("Please check your connection");
            return;
        }
        // Guard against empty input, double-sends, or missing user
        if (!text.trim() || sending || !user?.id) return;

        // add the user message to the list before the API responds
        const userMsg = {
            chatID: Date.now().toString(),
            text,
            actionTime: new Date().toISOString(),
            role: "user",
            userID: user.id,
            conversationID: openedConversationID!,
        };
        addChats([userMsg]);
        setText("");
        setSending(true);
        setTyping(true); // Show typing dots while waiting for AI response

        try {
            const res = await sendChatAPI({
                ...userMsg,
                userID: user.id,
                conversationID: openedConversationID!,
                repliedToChatID: null,
            });
            const responseChats = res.data?.messages || [];

            // Update lastActivity on the conversation so the sidebar list stays sorted correctly
            let updatedConversations = conversations?.map((c) => {
                return (c.id === openedConversationID!)
                    ? { ...c, lastActivity: res.data?.lastActivity }
                    : c;
            });
            setConversations(updatedConversations);
            addChats(responseChats); // Append AI reply to the chat list
        } catch (e: any) {
            showError(e.response?.data?.message);
        } finally {
            setSending(false);
            setTyping(false);
        }
    };

    // Toggle sidebar 
    const toggleSidebar = () => {
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

    return (
        <>
            <Loader visible={loading} message="Loading your chats..." />
            <SafeAreaView style={styles.safe}>
                <Sidebar
                    open={openSidebar}
                    sidebarX={sidebarX}
                    history={conversations}
                    onClose={toggleSidebar}
                />
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior="padding"
                >
                    {/* Header */}
                    <ThemedView style={styles.header}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <TouchableOpacity style={styles.sidebarBtn} onPress={toggleSidebar}>
                                <Ionicons
                                    name="menu-outline"
                                    size={28}
                                    color={colorScheme === "dark" ? Colors.dark.text : Colors.light.text}
                                />
                            </TouchableOpacity>
                            {/* Only navigates to edit if a conversation is open */}
                            <TouchableOpacity
                                style={styles.editBtn}
                                onPress={() => {
                                    if (!openedConversationID) return;
                                    router.push("/(chat)/conversation-edit");
                                }}
                            >
                                <Ionicons
                                    name="ellipsis-horizontal"
                                    size={22}
                                    color={colorScheme === "dark" ? Colors.dark.text : Colors.light.text}
                                />
                            </TouchableOpacity>
                        </View>
                        {/* Avatar shows profile picture or first letter of name as fallback */}
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

                    {/* Chat area */}
                    <ThemedView style={styles.chatContainer}>
                        <FlatList
                            ref={flatListRef}
                            data={chats}
                            keyExtractor={(item) => item.chatID}
                            contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 10 }}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="on-drag" // Dismiss keyboard when user scrolls
                            renderItem={({ item }) => (
                                <View
                                    style={[
                                        styles.chatRow,
                                        // Align user messages right, AI messages left
                                        item.role === "user"
                                            ? { justifyContent: "flex-end" }
                                            : { justifyContent: "flex-start" },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.bubble,
                                            item.role === "user" ? styles.rightBubble : styles.leftBubble,
                                        ]}
                                    >
                                        {/* Markdown lets AI responses render bold, lists, code blocks, etc. */}
                                        <Markdown
                                            style={{
                                                body: {
                                                    color: item.role === "user" ? "#fff" : "#000",
                                                    fontSize: 14,
                                                    lineHeight: 20,
                                                },
                                                bullet_list: {
                                                    marginVertical: 6,
                                                },
                                                list_item: {
                                                    marginVertical: 2,
                                                },
                                                strong: {
                                                    fontWeight: "bold",
                                                },
                                            }}
                                        >
                                            {item.text}
                                        </Markdown>
                                    </View>
                                </View>
                            )}
                        />
                        {/* Three dots shown while waiting for AI reply */}
                        {typing && (
                            <View style={styles.typingBox}>
                                <View style={styles.dot} />
                                <View style={styles.dot} />
                                <View style={styles.dot} />
                            </View>
                        )}
                    </ThemedView>

                    {/* Input Bar — send button only appears when there is text */}
                    <View style={styles.inputBar}>
                        <View style={{ flex: 1 }}>
                            <Input
                                placeholder="Ask me anything..."
                                value={text}
                                onChangeText={setText}
                            />
                        </View>
                        {text.trim().length > 0 && (
                            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                                <Ionicons name="send" size={20} color="#fff" />
                            </TouchableOpacity>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "transparent",
    },
    editBtn: {
        width: 38,
        height: 38,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
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
    chatContainer: {
        flex: 1,
        backgroundColor: "transparent",
        position: "relative",
    },
    chatRow: {
        flexDirection: "row",
    },
    bubble: {
        maxWidth: "85%",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 16,
    },
    leftBubble: {
        backgroundColor: "#ECEDEE",
        borderTopLeftRadius: 4, 
    },
    rightBubble: {
        backgroundColor: Colors.dark.primary,
        borderTopRightRadius: 4, 
    },
    chatText: {
        fontSize: 14,
    },
    inputBar: {
        flexDirection: "row",
        gap: 20,
        paddingHorizontal: 16,
    },
    sendBtn: {
        width: 50,
        height: 50,
        borderRadius: 14,
        backgroundColor: Colors.dark.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    typingBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingLeft: 20,
        paddingBottom: 10,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#999",
        opacity: 0.6,
    },
});