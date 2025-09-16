// server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { askChatGPT } from "./api.js"; // your existing api.js
import mongoose from "mongoose";
import { Chat } from "./src/models/model_chatbot.js";

dotenv.config();

const app = express();
const PORT = 3222;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/cedt29", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("MongoDB connected");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

// Middleware
app.use(cors()); // allow frontend on another port
app.use(express.json()); // parse JSON body

// Chat endpoint (improved: append to existing chat session)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, userId = "default", mode = "Standard", customMode = "Normal Negotiation", chatId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    const reply = await askChatGPT(messages);

    // Find or create chat session
    let chatDoc;
    if (chatId) {
      chatDoc = await Chat.findById(chatId);
    }
    if (!chatDoc) {
      // Create new chat session
      chatDoc = new Chat({
        userId,
        mode,
        customMode,
        history: [],
      });
    }

    // Append latest user message and AI reply
    const lastUserMsg = messages.filter(m => m.role === "user").pop();
    chatDoc.history.push({
      user: lastUserMsg ? lastUserMsg.content : "",
      bot: reply,
    });

    await chatDoc.save();

    res.json({ reply, chatId: chatDoc._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get response from ChatGPT" });
  }
});

// Optional: Get chat history for a user
app.get("/api/chat/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const chats = await Chat.find({ userId }).sort({ createdAt: -1 });
    res.json({ chats });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
