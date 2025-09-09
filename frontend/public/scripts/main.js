// main.js

import { chatWithInvestor } from './api.js';

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
  messageElement.textContent = message;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the bottom
}

/**
 * Toggles the visibility of the custom selector based on the main mode.
 */
function toggleCustomSelector() {
  customSelector.style.display = modeSelector.value === 'Negotiation' ? 'block' : 'none';
}

/**
 * Handles the form submission to send a new message.
 * @param {Event} event - The form submit event.
 */
async function handleSendMessage(event) {
  event.preventDefault();

  const userMessage = messageInput.value.trim();
  if (!userMessage) return;

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

  try {
    // Call the API and get the AI's response
    const aiResponse = await chatWithInvestor(userMessage, mode, customMode, chatHistory);

    // Add AI message to history
    chatHistory.push({ role: 'assistant', content: aiResponse });

    // Hide typing indicator and render AI's message
    typingIndicator.style.display = 'none';
    renderMessage(aiResponse, 'ai');

  } catch (error) {
    // Hide typing indicator and render error message
    typingIndicator.style.display = 'none';
    renderMessage("An error occurred. Please try again.", 'ai');
    console.error(error);
  }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
  // Initial check for custom selector visibility
  toggleCustomSelector();
});

modeSelector.addEventListener('change', toggleCustomSelector);
messageForm.addEventListener('submit', handleSendMessage);
