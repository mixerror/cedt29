import express from "express";
import { chatWithInvestor, getChatHistory, deleteChatHistory, editChatMessage } from "../controllers/chatController.js";

const router = express.Router();

router.post("/chat", chatWithInvestor);
router.get("/chat/:userId", getChatHistory);
router.delete("/chat/:userId", deleteChatHistory);
router.put("/chat/:userId/edit", editChatMessage);

export default router;
