import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  mode: { type: String, default: "Default mode" },
  customMode: { type: String, default: "Normal Negotiation" },
  history: [
    {
      user: String,
      bot: String
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export const Chat = mongoose.model("Chat", chatSchema);
