import { Chat } from "../models/Chat.js";
import { askChatGPT } from "../api.js";

// Modes / Prompts
const modes = {
  "Default mode": `คุณคือนักลงทุนที่เน้นการสอนและแนะนำ...
จำลองการต่อรองแบบสุภาพ ... (ย่อข้อความเพื่อความกระชับ)`,
  "Custom": {
    "Normal Negotiation": `คุณคือนักลงทุนในสถานการณ์การต่อรองจริง ...`,
    "Data-Driven": `คุณคือนักลงทุนที่เน้นตัวเลข ...`,
    "Risk-Averse": `คุณคือนักลงทุนสายระมัดระวังความเสี่ยง ...`,
    "Opportunistic / Maximize Benefit": `คุณคือนักลงทุนที่โฟกัสประโยชน์สูงสุด ...`,
    "Strategic Partner": `คุณคือนักลงทุนที่โฟกัส synergy ...`,
    "Visionary": `คุณคือนักลงทุนสาย Visionary ...`,
    "Impact Investor": `คุณคือนักลงทุนสาย Impact/ESG ...`,
    "Hobbyist / Topic-Focused": `คุณคือนักลงทุน Angel ที่สนใจหัวข้อเฉพาะ ...`
  }
};

// สร้าง prompt ตาม mode
function buildPrompt(mode, custom) {
  const basePrompt = `คุณคือ AI Investor ที่จำลองการ Pitch สตาร์ทอัพ
ใช้คำถามสั้น คม ตรงประเด็น และใช้ศัพท์การเงิน/สตาร์ทอัพ เช่น ROI, burn rate, LTV, CAC, break-even point, funding round, equity dilution, market share, customer base, revenue model, funding, growth.`;

  let styleText = "";

  if (mode === "Default mode") {
    styleText = modes[mode];
  } else if (mode === "Negotiation") {
    styleText = modes["Custom"][custom] || modes["Custom"]["Normal Negotiation"];
  } else {
    styleText = "โหมดไม่ถูกต้อง กรุณาเลือกใหม่";
  }

  return `${basePrompt}\n\n${styleText}`;
}

// POST /chat
export const chatWithInvestor = async (req, res) => {
  try {
    const { userId, userMessage, history = [], mode = "Default mode", custom = "Normal Negotiation" } = req.body;

    const systemPrompt = buildPrompt(mode, custom);

    const messages = [{ role: "system", content: systemPrompt }];
    history.forEach(h => {
      messages.push({ role: "user", content: h.user });
      messages.push({ role: "assistant", content: h.bot });
    });
    messages.push({ role: "user", content: userMessage });

    const reply = await askChatGPT(messages);

    // บันทึกลง MongoDB
    const chat = await Chat.findOne({ userId });
    if (chat) {
      chat.history.push({ user: userMessage, bot: reply });
      chat.mode = mode;
      chat.customMode = custom;
      await chat.save();
    } else {
      await Chat.create({
        userId,
        mode,
        customMode: custom,
        history: [{ user: userMessage, bot: reply }]
      });
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "ChatGPT API failed" });
  }
};

// GET /chat/:userId
export const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const chat = await Chat.findOne({ userId });
    res.status(200).json(chat || { history: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};

// DELETE /chat/:userId
export const deleteChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    await Chat.deleteOne({ userId });
    res.status(200).json({ message: "Chat history deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete chat history" });
  }
};

// PUT /chat/:userId/edit
export const editChatMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { index, user, bot } = req.body; // index ของข้อความใน history
    const chat = await Chat.findOne({ userId });
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    if (chat.history[index]) {
      if (user) chat.history[index].user = user;
      if (bot) chat.history[index].bot = bot;
      await chat.save();
      return res.status(200).json({ message: "Updated successfully" });
    }
    res.status(400).json({ error: "Invalid index" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to edit chat" });
  }
};
