import api from "./apiClient";

export const sendChatAPI = (data: {
  chatID: string,
  text: string;
  role: string,
  userID: string,
  conversationID?: string;
  repliedToChatID?: string | null;
  actionTime: string
}) => {
  return api.post("/chat/send", data);
};

export const getChatsAPI = (conversationID: string) => {
  return api.post("/chat/get", { conversationID });
};
