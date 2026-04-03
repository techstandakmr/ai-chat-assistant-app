import api from "./apiClient";

export const getConversationsAPI = (data: any) => {
  return api.post("/conversation/list",data);
};

export const updateConversationAPI = (data: {
  conversationID: string;
  updatingKey: "title" | "isPinned";
  updatingValue: any;
  lastActivity:Date
}) => {
  return api.patch("/conversation/update", data);
};

export const deleteConversationAPI = (conversationID: string) => {
  return api.delete("/conversation/delete", {
    data: { conversationID },
  });
};

export const deleteAllConversationsAPI = (userID: string) => {
  return api.delete("/conversations/delete-all", {
    data: { userID },
  });
};
