// server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { askChatGPT } from "./api.js"; // your existing api.js

dotenv.config();

const app = express();
const PORT = 3222;

// Middleware
app.use(cors()); // allow frontend on another port
app.use(express.json()); // parse JSON body

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    const reply = await askChatGPT(messages);
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get response from ChatGPT" });
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});