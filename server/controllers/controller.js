// Controllers
import {
    signup,
    login,
} from "../controllers/auth.controller.js";
import {
    getProfile,
    updateUser,
    deleteAccount
} from "../controllers/user.controller.js";
import {
    sendOTP,
    verifyOTP
} from "../controllers/otp.controller.js";

import {
    getChatsOfConversation,
    sendChat
} from "../controllers/chat.controller.js";

import {
    getConversations,
    updateConversation,
    deleteConversation,
    deleteAllConversations
} from "../controllers/conversation.controller.js";
export {
    signup,
    login,
    getProfile,
    updateUser,
    deleteAccount,
    sendOTP,
    verifyOTP,
    getChatsOfConversation,
    sendChat,
    getConversations,
    updateConversation,
    deleteConversation,
    deleteAllConversations,
};

