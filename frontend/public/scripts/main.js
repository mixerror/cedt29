// main.js

import { chatWithInvestor, uploadAndAnalyzeFile } from './api.js';

// --- UI Element References ---
const chatBox = document.getElementById('chat-box');
const modeSelector = document.getElementById('mode-selector');
const customSelector = document.getElementById('custom-selector');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const typingIndicator = document.getElementById('typing-indicator');
const uploadForm = document.getElementById('upload-form');
const fileInput = document.getElementById('file-input');

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
  messageElement.classList.add(
    'message',
    sender === 'user' ? 'bg-gray-200 p-2 rounded self-end' : 'bg-indigo-100 p-2 rounded self-start'
  );
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

  try {
    // Call the API and get the AI's response
    const aiResponse = await chatWithInvestor(userMessage, mode, customMode, chatHistory);

    // Add AI message to history
    chatHistory.push({ role: 'assistant', content: aiResponse });

    // Hide typing indicator and render AI's message
    typingIndicator.style.display = 'none';
    renderMessage(aiResponse, 'ai');

  } catch (error) {
    typingIndicator.style.display = 'none';
    renderMessage("❌ Error: Could not get AI response. Try again.", 'ai');
    console.error(error);
  }

  // Re-enable input and button
  messageInput.disabled = false;
  messageForm.querySelector('button[type="submit"]').disabled = false;
}

/**
 * Handles the file upload form.
 */
async function handleFileUpload(event) {
  event.preventDefault();
  const file = fileInput.files[0];
  if (!file) return;

  renderMessage(`📂 Uploaded file: ${file.name}`, 'user');
  typingIndicator.style.display = 'block';

  try {
    const mode = modeSelector.value;
    const customMode = customSelector.value;

    const aiResponse = await uploadAndAnalyzeFile(file, mode, customMode);

    chatHistory.push({  role: 'assistant', content: aiResponse });
    renderMessage(aiResponse, 'ai');
  } catch (error) {
    renderMessage("❌ Error: File upload or AI processing failed.", 'ai');
    console.error(error);
  } finally {
    typingIndicator.style.display = 'none';
  }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
  toggleCustomSelector();
  typingIndicator.style.display = 'none';
});

modeSelector.addEventListener('change', toggleCustomSelector);
messageForm.addEventListener('submit', handleSendMessage);
uploadForm.addEventListener('submit', handleFileUpload);

