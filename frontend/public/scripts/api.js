// src/api.js

import { BACKEND_URL, API_ENDPOINTS } from './config.js';

/**
 * Sends a chat message to the backend and returns the AI's response.
 * @param {string} message - The user's message to the AI.
 * @param {string} mode - The main investor mode (e.g., "Default mode", "Negotiation").
 * @param {string} customMode - The specific negotiation mode (e.g., "Data-Driven").
 * @param {Array<Object>} history - The full chat history of the conversation.
 * @returns {Promise<string>} - The AI's message as a string.
 */

export const chatWithInvestor = async (message, mode, customMode, history) => {
  try {
    const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.CHAT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        mode,
        customMode,
        history,
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.aiMessage;

  } catch (error) {
    console.error("Error communicating with the backend:", error);
    // Return a user-friendly error message
    return "I'm sorry, an error occurred while connecting. Please try again later.";
  }
};
