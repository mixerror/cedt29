// main.js
import { chatWithInvestor } from './api.js';


//import * as CRUD from './CRUD.js'

// --- UI Element References ---
const chatBox = document.getElementById('chat-box');
const modeSelector = document.getElementById('mode-selector');
const customSelector = document.getElementById('custom-selector');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const typingIndicator = document.getElementById('typing-indicator');

// --- State Management ---
let chatHistory = [];

// --- Functions ---

/**
 * Renders a new message in the chat box.
 * @param {string} message - The message content.
 * @param {'user' | 'ai'} sender - The message sender.
 */
function renderMessage(message, sender) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', `${sender}-message`);
  messageElement.setAttribute('role', 'status');
  messageElement.setAttribute('aria-live', 'polite');

  // Message text
  const textSpan = document.createElement('span');
  textSpan.textContent = message;
  messageElement.appendChild(textSpan);

  // Edit button
  const editBtn = document.createElement('button');
  editBtn.textContent = "✎"; // or "Edit"
  editBtn.classList.add('edit-btn');

  editBtn.addEventListener('click', () => {
    // Replace text with input field
    const input = document.createElement('input');
    input.type = "text";
    input.value = textSpan.textContent;
    input.classList.add('edit-input');

    // Replace span with input
    messageElement.replaceChild(input, textSpan);
    input.focus();

    // Save changes on Enter or blur
    const saveEdit = () => {
      const newText = input.value.trim();
      if (newText) {
        // Update DOM
        textSpan.textContent = newText;
        messageElement.replaceChild(textSpan, input);

        // Update chatHistory
        const index = chatHistory.findIndex(
          m => m.content === message && m.role === sender
        );
        if (index !== -1) {
          chatHistory[index].content = newText;
        }
      } else {
        // If empty, revert
        messageElement.replaceChild(textSpan, input);
      }
    };

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveEdit();
    });
  });

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = "✕";
  deleteBtn.classList.add('delete-btn');

  deleteBtn.addEventListener('click', () => {
    const index = chatHistory.findIndex(
      m => m.content === message && m.role === sender
    );
    if (index !== -1) chatHistory.splice(index, 1);
    messageElement.remove();
  });

  messageElement.appendChild(editBtn);
  messageElement.appendChild(deleteBtn);

  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll
}

/**
 * Toggles the visibility of the custom selector based on the main mode.
 */
function toggleCustomSelector() {
  //customSelector.style.display = modeSelector.value === 'Negotiation' ? 'block' : 'none';
  customSelector.style.display = modeSelector.value === 'Negotiation';
  customSelector.style.display = modeSelector.value === 'Data-Driven';
}

/**
 * Handles the form submission to send a new message.
 * @param {Event} event - The form submit event.
 */
async function handleSendMessage(event) {
  event.preventDefault();

  const userMessage = messageInput.value.trim();
  if (!userMessage) return;

  // Disable input and button
  messageInput.disabled = true;
  messageForm.querySelector('button[type="submit"]').disabled = true;

  // Clear input and display user message
  messageInput.value = '';
  renderMessage(userMessage, 'user');
  
  // Add user message to history
  chatHistory.push({ role: 'user', content: userMessage });

  // Show typing indicator
  typingIndicator.style.display = 'block';

  // Get selected modes
  const mode = modeSelector.value;
  const customMode = customSelector.value;

  console.log(mode)

const personality = {
  Standard: {
    description: "คุณคือนักลงทุนที่เน้นการสอนและแนะนำ จำลองการต่อรองแบบสุภาพ อ่อนน้อม ... โหมดนี้เหมาะกับผู้เริ่มต้น (เอายาวไม่เกิน 3 บรรทัด)"
  },
  Negotiation: {
    description: "คุณคือนักลงทุนในสถานการณ์การต่อรองจริง มีความจริงจัง แต่ยังคงสุภาพ ... เน้นเรื่องตัวเลข เช่น market share, revenue, profit, customer base (เอายาวไม่เกิน 3 บรรทัด)"
  }
};

  try {
    // Call the API and get the AI's response

    // const aiResponse = await chatWithInvestor(userMessage, mode, customMode, chatHistory); -- OLD API

    const messages = [
      {
        role: "system",
        content: personality[mode].description
      },
      {
      role: "user"
      , content: userMessage
      }
    ]

    const res = await fetch("http://localhost:3222/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    const data = await res.json();
    console.log(data.reply);

    

    // Add AI message to history
    chatHistory.push({ role: 'assistant', content: data.reply});

    // Hide typing indicator and render AI's message
    typingIndicator.style.display = 'none';
    renderMessage(data.reply, 'ai');

  } catch (error) {
    // Hide typing indicator and render error message
    typingIndicator.style.display = 'none';
    renderMessage("An error occurred. Please try again.", 'ai');
    console.error(error);
  }
  // Re-enable input and button
  messageInput.disabled = false;
  messageForm.querySelector('button[type="submit"]').disabled = false;
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
  // Initial check for custom selector visibility
  toggleCustomSelector();
  // Hide typing indicator on load
  typingIndicator.style.display = 'none';
});

modeSelector.addEventListener('change', toggleCustomSelector);
messageForm.addEventListener('submit', handleSendMessage);

