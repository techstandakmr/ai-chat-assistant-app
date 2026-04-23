import React, { createContext, useContext, useState } from "react";

type Conversation = {
  id: string;
  title: string;
  lastChat?: string;
  lastActivity?: string;
  isPinned?: boolean;
};

type Chat = {
  chatID: string;
  text: string;
  role: string; // "user" or "assistant"
  conversationID: string;
  actionTime: string;
};

type ChatContextType = {
  conversations: Conversation[];
  chats: Chat[];
  openedConversationID: string | null; // ID of the currently active conversation
  setOpenedConversationID: (id: string | null) => void;
  setConversations: (c: Conversation[]) => void;
  addChats: (m: Chat[]) => void;
  clearChats: () => void;
  setChats:(m: Chat[]) => void;
};

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [conversations, setConversationsState] = useState<Conversation[]>([]);
  const [openedConversationID, setOpenedConversationID] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);

  const setConversations = (c: Conversation[]) => setConversationsState(c);

  // Merges new chats into existing ones — deduplicates by chatID and sorts by time
  const addChats = (newChats: Chat[]) => {
    setChats(prev => {
      const map = new Map<string, Chat>();
      // Load existing chats into map
      prev.forEach(msg => map.set(msg.chatID, msg));
      // Overwrite or add new chats
      newChats.forEach(msg => map.set(msg.chatID, msg));
      return Array.from(map.values()).sort(
        (a, b) => new Date(a.actionTime).getTime() - new Date(b.actionTime).getTime()
      );
    });
  };

  // Resets all chat state — used on logout or account deletion
  const clearChats = () => {
    setConversationsState([]);
    setChats([]);
    setOpenedConversationID(null);
  };
  console.log("CNTXT",conversations);
    return (
    <ChatContext.Provider
      value={{
        openedConversationID,
        setOpenedConversationID,
        conversations,
        chats,
        setConversations,
        addChats,
        clearChats,
        setChats
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
};