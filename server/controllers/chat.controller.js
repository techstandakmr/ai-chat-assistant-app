import Chat from "../models/chat.model.js";
import Conversation from "../models/conversation.model.js";
import { createConversation } from "./conversation.controller.js"
import axios from "axios";

// Return all chats for a given conversation (used by client to load history)
export const getChatsOfConversation = async (req, res) => {
    try {
        const { conversationID } = req.body;
        const chats = await getChatsByConversationID(conversationID);
        res.json(chats);
    } catch (e) {
        res.status(500).json({ message: "Fetch chats failed" });
    }
};

// Reusable query — sorted ascending so history renders oldest > newest
const getChatsByConversationID = async (conversationID) => {
    return await Chat.find({ conversationID }).sort({ createdAt: 1 });
};

const talkWithAI = async ({
    sendingText,
    chatsOfConversation,
    repliedToChat
}) => {
    // Shape stored chats into the role/content format Groq expects
    const formattedHistory = chatsOfConversation?.map(chat => ({
        role: chat.role,
        content: chat.text
    }));

    // First message in a conversation > ask AI to produce a short title instead
    let systemContent = formattedHistory?.length == 0 ?
        "Generate a title for 8 words only"
        :
        "You are a helpful AI assistant. Respond clearly, concisely, and accurately."

    try {
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system", content: systemContent
                    },
                    ...formattedHistory, // Chat history for better context
                    // Inject the message being replied to right before the new message (gives AI direct reference)
                    ...(repliedToChat ? [{
                        role: repliedToChat.role,
                        content: repliedToChat.text
                    }] : []),
                    { role: "user", content: sendingText }, // User's actual chat
                ],
                temperature: 0.7, // Controls randomness in the output
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 
                },
            }
        );
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("AI Error:", error.response?.data || error.message);
        throw new Error("AI generation failed");
    }
}

export const sendChat = async (req, res) => {
    try {
        let { chatID, text, conversationID, role, repliedToChatID, userID, actionTime } = req.body;

        // Resolve existing conversation or treat as new if no ID provided
        let conversation = conversationID ? await Conversation.findById(conversationID) : null;

        // The chat user replied about, IF
        const repliedToChat = repliedToChatID
            ? await Chat.findById(repliedToChatID)
            : null;

        // New conversation — generate a title from the first message before anything else
        if (!conversation) {
            // First, create title for this new conversation 
            const title = await talkWithAI({
                sendingText: text,
                chatsOfConversation: [],
                repliedToChat: null
            });
            conversation = await createConversation({ title, userID });
            conversationID = conversation?._id;
        };

        // Load existing history so AI has full context for its reply
        const chatsOfConversation = await getChatsByConversationID(conversationID);
        const chatFromAI = await talkWithAI({
            sendingText: text,
            chatsOfConversation,
            repliedToChat
        });

        // Save both the user message and AI reply in one batch
        const chats = await Chat.create([
            {
                chatID,
                userID,
                text,
                role: role || "user",
                conversationID,
                actionTime
            },
            {
                chatID: Date.now().toString(),
                userID,
                text: chatFromAI,
                role: "assistant",
                conversationID,
                actionTime: new Date().toISOString()
            }
        ]);

        // Bump lastActivity so conversation list can sort by recent usage
        let lastActivity = new Date();
        await Conversation.findByIdAndUpdate(
            conversationID,
            lastActivity
        );

        res.status(201).json({
            chats:chats,
            lastActivity
        });
    } catch (e) {
        res.status(500).json({ message: "Send chat failed" });
    }
};