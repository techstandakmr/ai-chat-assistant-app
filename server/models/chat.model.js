import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    // Custom identifier for the chat on client side before saving in DB
    chatID: {
      type: String
    },
    // who sent the chat or received by the AI
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    // relationship field (belongs to which conversation)
    conversationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    // chat text
    text: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      default: "user",
    },
    // Time when message was delivered to this receiver, or sent from the user
    actionTime: {
      type: String
    },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
