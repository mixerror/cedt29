import { BACKEND_URL } from "./config.js";

export async function sendMessage(messages) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
    let aiReply = "";

    if (data && data.reply) {
      if (typeof data.reply === "string") aiReply = data.reply;
      else if (typeof data.reply === "object" && data.reply.content) aiReply = data.reply.content;
      else aiReply = String(data.reply);
    } else {
      aiReply = "No reply from server.";
    }

    return aiReply;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
}
