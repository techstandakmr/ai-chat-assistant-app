import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Divider } from "@/components/ui";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import { useChat } from "@/context/ChatContext";
import { setAppTheme } from "@/hooks/use-color-scheme";
import { deleteAllConversationsAPI } from "@/services/conversation.api";
import Toast from 'react-native-toast-message';
import { showError, showInfo, showSuccess } from "@/utils/toast";
import Loader from "@/components/Loader";
import { useNetwork } from "@/context/NetworkContext";

export default function Settings() {
  const { isConnected } = useNetwork();
  const { logout } = useAuth();
  const { user } = useUser();
  const { setOpenedConversationID, conversations, setConversations } = useChat();
  const router = useRouter();

  const [theme, setTheme] = useState<"dark" | "light" | "system">("system");
  const colorScheme = useColorScheme();

  // Controls full-screen loader visibility and its message
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            setLoadingText("Logging out...");
            await logout();
            setLoading(false);
            setLoadingText("");
            // Clear the entire navigation stack after logout
            router.dismissAll();
          }
        }
      ]
    );
  };

  const handleDeleteAllChats = () => {
    // Prevent API call when offline
    if (!isConnected) {
      showError("Please check your connection");
      return;
    }

    if (conversations?.length > 0) {
      Alert.alert(
        "Delete All Chats",
        "This will permanently delete all conversations. This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                setLoadingText("Deleting all conver...");
                let userID = user?.id;
                await deleteAllConversationsAPI(userID!);
                setLoading(false);
                setLoadingText("");
                // Reset chat state so UI reflects empty conversations
                setOpenedConversationID(null);
                setConversations([]);
                router.replace("/(chat)");
                showSuccess("All conversations deleted successfully");
              } catch (err) {
                setLoading(false);
                setLoadingText("");
                showError("Failed to delete conversations");
              }
            }
          }
        ]
      );
    } else {
      // Nothing to delete — inform the user
      showError("You have no conversations")
    }
  };

  return (
    <>
      {/* Full-screen loader shown during async operations */}
      <Loader visible={loading} message={loadingText} />

      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22}
              color={
                colorScheme === "dark" ? Colors.dark.text : Colors.light.text
              }
            />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Settings</ThemedText>
        </ThemedView>

        {/* Scrollable settings content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Appearance — theme selection with active checkmark indicator */}
          <ThemedView style={styles.card}>
            <ThemedText style={styles.sectionTitle}>Appearance</ThemedText>
            <TouchableOpacity style={styles.row} onPress={() => {
              setTheme("dark");
              setAppTheme("dark");
            }}>
              <ThemedText>Dark Mode</ThemedText>
              {theme === "dark" && <Ionicons name="checkmark-circle" size={20} color={Colors.dark.primary} />}
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={styles.row} onPress={() => {
              setTheme("light");
              setAppTheme("light");
            }}>
              <ThemedText>Light Mode</ThemedText>
              {theme === "light" && <Ionicons name="checkmark-circle" size={20} color={Colors.dark.primary} />}
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={styles.row} onPress={() => {
              setTheme("system");
              setAppTheme("system");
            }}>
              <ThemedText>System Default</ThemedText>
              {theme === "system" && <Ionicons name="checkmark-circle" size={20} color={Colors.dark.primary} />}
            </TouchableOpacity>
          </ThemedView>

          {/* Conversation Controls — destructive actions */}
          <ThemedView style={styles.card}>
            <ThemedText style={styles.sectionTitle}>Conversation Controls</ThemedText>
            <TouchableOpacity style={styles.rowDanger} onPress={handleDeleteAllChats}>
              <ThemedText style={styles.dangerText}>Delete All Conversations</ThemedText>
              <Ionicons name="trash-outline" size={18} color="#E53935" />
            </TouchableOpacity>
          </ThemedView>

          {/* Account — password, logout, and account deletion */}
          <ThemedView style={styles.card}>
            <ThemedText style={styles.sectionTitle}>Account</ThemedText>
            <TouchableOpacity style={styles.row} onPress={() => router.push("/(profile)/update-password")}>
              <ThemedText>Update Password</ThemedText>
              <Ionicons name="chevron-forward" size={18} color={Colors.dark.textSecondary} />
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={styles.row}
              onPress={handleLogout}
            >
              <ThemedText>Logout</ThemedText>
              <Ionicons name="log-out-outline" size={18} color={Colors.dark.textSecondary} />
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity style={styles.rowDanger} onPress={() => router.push("/(profile)/delete-account")}>
              <ThemedText style={styles.dangerText}>Delete Account</ThemedText>
              <Ionicons name="warning-outline" size={18} color="#E53935" />
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
    paddingBottom: 40,
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
    fontSize: 26,
    fontWeight: "800",
  },
  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
    color: Colors.dark.textSecondary,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  rowDanger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  dangerText: {
    color: "#E53935",
    fontWeight: "600",
  },
});