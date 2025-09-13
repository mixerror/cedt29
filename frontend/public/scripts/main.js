import { chatWithInvestor, uploadAndAnalyzeFile } from './api.js';

// Elements
const chatBox = document.getElementById('chat-box');
const modeSelector = document.getElementById('mode-selector');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const typingIndicator = document.getElementById('typing-indicator');
const uploadForm = document.getElementById('upload-form');
const fileInput = document.getElementById('file-input');

const menuBtn = document.getElementById("menu-btn");
const menuDropdown = document.getElementById("menu-dropdown");
const historyBtn = document.getElementById("history-btn");
const historyPanel = document.getElementById("history-panel");
const historyList = document.getElementById("history-list");

let chatHistory = [];

// Functions
function renderMessage(message, sender) {
  const el = document.createElement('div');
  el.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
  el.textContent = message;
  chatBox.appendChild(el);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function handleSendMessage(e) {
  e.preventDefault();
  const userMessage = messageInput.value.trim();
  if (!userMessage) return;

  renderMessage(userMessage, 'user');
  chatHistory.push({ role: 'user', content: userMessage });

  typingIndicator.style.display = 'block';
  messageInput.value = '';

  try {
    const aiResponse = await chatWithInvestor(userMessage, modeSelector.value, null, chatHistory);
    chatHistory.push({ role: 'assistant', content: aiResponse });
    renderMessage(aiResponse, 'ai');
  } catch {
    renderMessage("❌ Error: Could not get AI response.", 'ai');
  } finally {
    typingIndicator.style.display = 'none';
  }

  renderHistory();
}

async function handleFileUpload(e) {
  e.preventDefault();
  const file = fileInput.files[0];
  if (!file) return;

  renderMessage(`📂 Uploaded: ${file.name}`, 'user');
  typingIndicator.style.display = 'block';

  try {
    const aiResponse = await uploadAndAnalyzeFile(file, modeSelector.value, null);
    chatHistory.push({ role: 'assistant', content: aiResponse });
    renderMessage(aiResponse, 'ai');
  } catch {
    renderMessage("❌ File upload failed.", 'ai');
  } finally {
    typingIndicator.style.display = 'none';
  }

  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";
  if (chatHistory.length === 0) {
    historyList.innerHTML = "<li>ยังไม่มีประวัติ</li>";
    return;
  }
  chatHistory.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.role === "user" ? "👤" : "🤖"} ${item.content}`;
    historyList.appendChild(li);
  });
}

// Events
document.addEventListener('DOMContentLoaded', () => {
  if (menuBtn && menuDropdown) {
    menuBtn.addEventListener("click", () => {
      const isOpen = menuDropdown.style.display === "block";
      menuDropdown.style.display = isOpen ? "none" : "block";
    });
  }
  if (historyBtn && historyPanel) {
    historyBtn.addEventListener("click", () => {
      historyPanel.classList.toggle("active");
      menuDropdown.style.display = "none";
      renderHistory();
    });
  }
});

messageForm.addEventListener('submit', handleSendMessage);
uploadForm.addEventListener('submit', handleFileUpload);
