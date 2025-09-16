// // backend/routes/chat.js

// import express from "express";
// import { askChatGPT } from "../api.js";

// const router = express.Router();

// router.post("/chat", async (req, res) => {
//   try {
//     const { messages } = req.body;

//     if (!messages || !Array.isArray(messages)) {
//       return res.status(400).json({ error: "Invalid messages format" });
//     }

//     // Call ChatGPT
//     const reply = await askChatGPT(messages);

//     res.json({ reply });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to get response from ChatGPT" });
//   }
// });

// export default router;
