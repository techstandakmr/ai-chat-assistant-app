import express from "express";
import { jwtVerify } from "../middlewares/jwtVerify.js";

// Controllers
import {
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
} from "../controllers/controller.js";


const router = express.Router();

// auth & user routes
router.post("/auth/signup", signup);
router.post("/auth/login", login);
router.get("/user/profile", jwtVerify, getProfile);
router.patch("/user/update-user", updateUser);
router.delete("/user/delete-account", jwtVerify, deleteAccount);
router.post("/user/send-otp", sendOTP);
router.post("/user/verify-otp", verifyOTP);

// chat & conversation routes
router.post("/chat/send", jwtVerify, sendChat);
router.post("/chat/get", jwtVerify, getChatsOfConversation);
router.post("/conversation/list", jwtVerify, getConversations);
router.patch("/conversation/update", jwtVerify, updateConversation);
router.delete("/conversation/delete", jwtVerify, deleteConversation);
router.delete("/conversations/delete-all", jwtVerify, deleteAllConversations);



export default router;
