import { useEffect, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { Input } from "@/components/ui";
import { Colors } from "@/constants/theme";
import { updateConversationAPI, deleteConversationAPI } from "@/services/conversation.api";
import { useChat } from "@/context/ChatContext";
import { validateTitle } from "@/utils/formValidators";
import Toast from 'react-native-toast-message';
import { showError, showInfo, showSuccess } from "@/utils/toast";
import Loader from "@/components/Loader";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNetwork } from "@/context/NetworkContext";

export default function EditConversation() {
  const { conversations, openedConversationID, setConversations } = useChat();
  const router = useRouter();

  // Derive the current conversation from context instead of passing it via props/params
  const openedConversation = conversations?.find((prev) => prev?.id === openedConversationID)
  const [name, setName] = useState(openedConversation?.title || "Title");
  const [pinned, setPinned] = useState(openedConversation?.isPinned);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ name: "" });
  const { isConnected } = useNetwork();

  // Sync local name state if the conversation title changes externally
  useEffect(() => {
    if (openedConversation?.title) setName(String(openedConversation?.title));
  }, [openedConversation?.title]);

  // Validate on every keystroke so errors appear inline as user types
  const handleNameChange = (value: string) => {
    setName(value);
    const res = validateTitle(value);
    setErrors(prev => ({
      ...prev,
      name: res.error || "",
    }));
  };

  const handleUpdate = async () => {
    if (!isConnected) {
      showError("Please check your connection");
      return;
    }

    // Skip API call if nothing actually changed
    const nameChanged = name !== openedConversation?.title;
    if (!nameChanged) {
      showInfo("Nothing to update");
      return;
    }

    const nameVal = validateTitle(name);
    if (!nameVal.isValid) {
      setErrors({ name: nameVal.error || "" });
      return;
    }

    try {
      setLoading(true);
      await updateConversationAPI({
        conversationID: openedConversationID!,
        updatingKey: "title",
        updatingValue: name,
        lastActivity: new Date(),
      });

      // Update context locally so sidebar reflects the new title without a refetch
      let updatedConversations = conversations.map((c) => {
        return c.id === openedConversationID
          ? { ...c, title: name }
          : c;
      });
      setConversations(updatedConversations);
      showSuccess("Conversation updated successfully");
      router.back();
    } catch (err: any) {
      showError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePinToggle = async () => {
    if (!isConnected) {
      showError("Please check your connection");
      return;
    }
    try {
      setLoading(true);
      await updateConversationAPI({
        conversationID: openedConversationID!,
        updatingKey: "isPinned",
        updatingValue: !pinned,
        lastActivity: new Date(),
      });

      // Flip pin state locally and in context to keep UI in sync
      setPinned(!pinned);
      let updatedConversations = conversations.map(c =>
        c.id === openedConversationID ? { ...c, isPinned: !pinned } : c
      )
      setConversations(updatedConversations);
    } catch (err: any) {
      showError("Failed to update pin status");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isConnected) {
      showError("Please check your connection");
      return;
    }

    // Native confirmation dialog before irreversible delete
    Alert.alert("Delete Conversation", "Are you sure you want to delete this chat?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            let conversationID = openedConversationID;
            await deleteConversationAPI(conversationID!);

            // Remove from context so sidebar updates instantly without a refetch
            let updatedConversations = conversations.filter((c) => {
              return c.id !== openedConversationID
            });
            setConversations(updatedConversations);
            showSuccess("Conversation deleted successfully");
            router.replace("/(chat)"); // replace so user can't navigate back to a deleted conversation
          } catch (err: any) {
            showError(err.response?.data?.message || "Something went wrong");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <>
      <Loader visible={loading} message="Saving changes..." />
      <SafeAreaView style={styles.container}>
        <ThemedText style={styles.title}>Conversation Settings</ThemedText>
        <ThemedText style={styles.subTitle}>
          Update your conversation details
        </ThemedText>

        {/* Rename */}
        <Input
          placeholder="Conversation Name"
          value={name}
          onChangeText={handleNameChange}
        />
        {!!errors.name && (
          <ThemedText style={styles.error}>{errors.name}</ThemedText>
        )}

        {/* Action buttons: pin, save, delete, cancel */}
        <View style={styles.iconRow}>
          {/* Pin — active state fills button with primary color */}
          <TouchableOpacity
            style={[styles.iconBtn, pinned && styles.iconBtnActive]}
            onPress={handlePinToggle}
          >
            <AntDesign
              name="pushpin"
              size={18}
              color={pinned ? "#fff" : Colors.dark.primary}
            />
          </TouchableOpacity>

          {/* Save */}
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: "#E8F5E9" }]}
            onPress={handleUpdate}
          >
            <Ionicons name="save-outline" size={18} color="#4CAF50" />
          </TouchableOpacity>

          {/* Delete */}
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: "#FDECEA" }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={18} color="#ff3b3b" />
          </TouchableOpacity>

          {/* Cancel — goes back without saving */}
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: "#F1F1F1" }]}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subTitle: {
    color: Colors.dark.textSecondary,
    marginBottom: 22,
    textAlign: "center",
  },
  iconRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F4F4",
    // subtle shadow (iOS)
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    // android shadow
    elevation: 2,
  },
  iconBtnActive: {
    backgroundColor: Colors.dark.primary,
  },
  cancel: {
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginTop: 12,
  },
  pinBtn: {
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 14,
  },
  pinActive: {
    backgroundColor: Colors.dark.primary,
  },
  pinText: {
    fontWeight: "600",
  },
  deleteBox: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#ff3b3b",
    alignItems: "center",
  },
  deleteText: {
    color: "#fff",
    fontWeight: "700",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
});