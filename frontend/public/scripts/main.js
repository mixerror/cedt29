// --- UI Element References ---
const chatBox = document.getElementById("chat-box");
const modeSelector = document.getElementById("mode-selector");
const customSelector = document.getElementById("custom-selector");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const typingIndicator = document.getElementById("typing-indicator");

// --- State ---
let chatHistory = [];

// Render message (plain text)
function renderMessage(message, sender) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", `${sender}-message`);

  const span = document.createElement("span");
  span.textContent = message;
  messageElement.appendChild(span);

  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Toggle custom selector
function toggleCustomSelector() {
  const v = modeSelector.value;
  customSelector.classList.toggle(
    "hidden",
    !(v === "Negotiation" || v === "Data-Driven"),
  );
}

// Handle submit
async function handleSendMessage(event) {
  event.preventDefault();

  const userMessage = messageInput.value.trim();
  if (!userMessage) return;

  messageInput.disabled = true;
  const submitBtn = messageForm.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  messageInput.value = "";
  renderMessage(userMessage, "user");
  chatHistory.push({ role: "user", content: userMessage });

  typingIndicator.classList.remove("hidden");

  const mode = modeSelector.value;
  const customMode = customSelector.value;

  const personality = {
    Standard: {
      description: "คุณคือนักลงทุนที่เน้นการสอนและแนะนำ ... (ไม่เกิน 3 บรรทัด)",
    },
    Negotiation: {
      description:
        "คุณคือนักลงทุนในสถานการณ์การต่อรองจริง ... (ไม่เกิน 3 บรรทัด)",
    },
    "Data-Driven": {
      description: "Data-driven investor mode.",
    },
  };

  try {
    const messages = [
      {
        role: "system",
        content:
          (personality[mode] && personality[mode].description) ||
          personality.Standard.description,
      },
      { role: "user", content: userMessage },
    ];

    const res = await fetch("http://localhost:3222/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    const data = await res.json();
    let aiReply = "";

    if (data && data.reply) {
      if (typeof data.reply === "string") aiReply = data.reply;
      else if (typeof data.reply === "object" && data.reply.content)
        aiReply = data.reply.content;
      else aiReply = String(data.reply);
    } else {
      aiReply = "No reply from server.";
    }

    chatHistory.push({ role: "assistant", content: aiReply });
    typingIndicator.classList.add("hidden");
    renderMessage(aiReply, "ai");
  } catch (error) {
    typingIndicator.classList.add("hidden");
    renderMessage("An error occurred. Please try again.", "ai");
    console.error(error);
  } finally {
    messageInput.disabled = false;
    if (submitBtn) submitBtn.disabled = false;
  }
}

// --- Events ---
document.addEventListener("DOMContentLoaded", () => {
  toggleCustomSelector();
  typingIndicator.classList.add("hidden");
});

modeSelector.addEventListener("change", toggleCustomSelector);
messageForm.addEventListener("submit", handleSendMessage);
