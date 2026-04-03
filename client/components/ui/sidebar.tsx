import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Animated, StyleSheet, TouchableOpacity, Pressable, View } from "react-native";
import { ThemedView } from "../themed-view";
import { useChat } from "@/context/ChatContext";

type SidebarItem = {
    id: string;
    title: string;
    lastChat?: string;
    lastActivity?: string;
    isPinned?: boolean;
};

type SidebarProps = {
    open: boolean;
    sidebarX: Animated.Value;
    history: SidebarItem[];
    onClose: () => void;
};

export default function Sidebar({
    open,
    sidebarX,
    history,
    onClose,
}: SidebarProps) {
    const sortedHistory = [...history].sort((a, b) => {
        // pinned always on top
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        // sort by lastActivity (latest first)
        const timeA = new Date(a.lastActivity || 0).getTime();
        const timeB = new Date(b.lastActivity || 0).getTime();
        return timeB - timeA;
    });
    const { openedConversationID, setOpenedConversationID } = useChat();
    const colorScheme = useColorScheme();
    const router = useRouter();

    if (!open) return null;

    return (
        <>
            {/*overlay (outside click close) */}
            <Pressable style={styles.overlay} onPress={onClose} />

            <Animated.View
                style={[
                    styles.sidebar,
                    {
                        backgroundColor:
                            colorScheme === "dark" ? Colors.dark.card : "#e9eaeb",
                        transform: [{ translateX: sidebarX }],
                    },
                ]}
            >
                <ThemedView style={{ backgroundColor: "transparent" }}>

                    {/* header */}
                    <ThemedView style={styles.headerRow}>
                        <ThemedText style={styles.sidebarTitle}>Chats</ThemedText>

                        {/* new conversation */}
                        <TouchableOpacity
                            style={styles.newChatBtn}
                            onPress={() => {
                                onClose();
                                router.push("/(chat)");
                            }}
                        >
                            <Ionicons name="add" size={22} color="#fff" />
                        </TouchableOpacity>
                    </ThemedView>

                    {/* conversation list */}
                    {sortedHistory.map((item) => {
                        const isActive = item.id === openedConversationID;

                        return (
                            <View key={item.id} style={styles.row}>
                                <TouchableOpacity
                                    style={[
                                        styles.sidebarItem,
                                        isActive && styles.activeItem
                                    ]}
                                    onPress={() => {
                                        onClose();
                                        setOpenedConversationID(item.id);
                                        router.push("/(chat)/chatBox");
                                    }}
                                >
                                    <Ionicons
                                        name="chatbubble-outline"
                                        size={18}
                                        color={
                                            isActive
                                                ? Colors.dark.primary
                                                : Colors.dark.textSecondary
                                        }
                                    />

                                    <View style={styles.textRow}>
                                        {item.isPinned && (
                                            <Ionicons
                                                name="pin"
                                                size={14}
                                                color={Colors.dark.primary}
                                            />
                                        )}

                                        <ThemedText
                                            style={[
                                                styles.sidebarText,
                                                isActive && styles.activeText
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {item.title}
                                        </ThemedText>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </ThemedView>

                {/* settings button */}
                <TouchableOpacity
                    style={styles.settingsBtn}
                    onPress={() => {
                        onClose();
                        router.push("/(settings)");
                    }}
                >
                    <Ionicons
                        name="settings-outline"
                        size={20}
                        color={Colors.dark.textSecondary}
                    />
                    <ThemedText style={styles.settingsText}>Settings</ThemedText>
                </TouchableOpacity>
            </Animated.View>
        </>
    );
}

const styles = StyleSheet.create({

    overlay: {
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.25)",
        zIndex: 9,
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
        justifyContent: "space-between",
    },

    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        backgroundColor: "transparent",
    },

    sidebarTitle: {
        fontSize: 18,
        fontWeight: "700",
    },

    newChatBtn: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: Colors.dark.primary,
        justifyContent: "center",
        alignItems: "center",
    },

    row: {
        position: "relative",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },

    sidebarItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 10,
        flex: 1,
        paddingHorizontal: 6,
    },

    sidebarText: {
        fontSize: 14,
        flex: 1,
    },
    activeItem: {
        backgroundColor: "rgba(0,0,0,0.08)", 
        borderRadius: 10,
        paddingHorizontal: 6,
    },
    activeText: {
        fontWeight: "700",
        color: Colors.dark.primary,
    },

    textRow: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    settingsBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.08)",
        marginBottom: 40,
    },

    settingsText: {
        fontSize: 14,
        fontWeight: "600",
    },
});
