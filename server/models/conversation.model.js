import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    // owner of conversation
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Auto-generated title when chat starts
    title: {
      type: String,
      default: "New Chat",
    },

    // Last activity time (for sorting chat list)
    lastActivity: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isPinned: {
      type: Boolean
    }
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
