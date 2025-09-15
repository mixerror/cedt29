// api.js
import OpenAI from "openai";
import "dotenv/config";

// สร้าง client ของ OpenAI
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * ฟังก์ชันเรียก ChatGPT
 * @param {Array} messages - array ของข้อความ [{role: "user"|"system"|"assistant", content: "ข้อความ"}]
 * @returns {Promise<string>} - ตอบกลับจาก ChatGPT
 */
export async function askChatGPT(messages) {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // หรือ gpt-4o, gpt-3.5-turbo
      messages: messages,
      temperature: 0.7,
    });

    // ดึงข้อความจาก choices ตัวแรก
    return response.choices[0].message.content;
  } catch (error) {
    console.error("❌ ChatGPT API Error:", error);
    throw new Error("ChatGPT API failed");
  }
}
