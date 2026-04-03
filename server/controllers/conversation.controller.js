import Chat from "../models/chat.model.js";
import Conversation from "../models/conversation.model.js";

export const getConversations = async (req, res) => {
    try {
        const { userID } = req.body;

        // Fetch user's conversations, most recently updated first
        const conversations = await Conversation.find({ userID })
            .sort({ updatedAt: -1 })
            .lean(); // .lean() returns plain JS objects — faster, no Mongoose overhead

        // Rename _id → id for cleaner client-side usage
        const formatted = conversations.map(({ _id, ...rest }) => ({
            id: _id,
            ...rest,
        }));

        res.json(formatted);
    } catch (e) {
        res.status(500).json({
            message: "Fetch conversations failed"
        });
    }
};


// Internal helper (not an HTTP handler) — called directly by chat controller on first message
export const createConversation = async ({ title, userID }) => {
    try {
        const conversation = await Conversation.create({
            userID,
            title: title || "New Chat", // Fallback if AI title generation fails
        });

        return conversation;
    } catch (e) {
        console.error(e);
        throw e; // Bubble up so the caller can handle it
    }
};

export const updateConversation = async (req, res) => {
    try {
        const { conversationID, updatingKey, updatingValue } = req.body;

        // Whitelist to prevent arbitrary field overwrites
        const allowedKeys = ["title", "isPinned"];
        if (!allowedKeys.includes(updatingKey)) {
            return res.status(400).json({ message: "Invalid update field" });
        }

        // { new: true } returns the updated document instead of the old one
        const updated = await Conversation.findByIdAndUpdate(
            conversationID,
            { [updatingKey]: updatingValue },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        res.json({
            success: true,
            message: "Conversation updated successfully",
            conversation: updated
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Update conversation failed" });
    }
};


export const deleteConversation = async (req, res) => {
    try {
        const { conversationID } = req.body;

        const conversation = await Conversation.findById(conversationID);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        // Delete all chats in conversation first to avoid orphaned records
        await Chat.deleteMany({ conversationID });

        // Then delete the conversation itself
        await Conversation.findByIdAndDelete(conversationID);

        res.json({
            success: true,
            message: "Conversation deleted successfully"
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Delete conversation failed" });
    }
};


export const deleteAllConversations = async (req, res) => {
    try {
        const { userID } = req.body;

        const conversation = await Conversation.find({ userID });
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        // Chats first, then conversations — same order as single delete to stay consistent
        await Chat.deleteMany({ userID });
        await Conversation.deleteMany({ userID });

        res.json({
            success: true,
            message: "All conversations deleted successfully"
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Delete conversations failed" });
    }
};