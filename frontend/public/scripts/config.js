/**
 * @typedef {Object} Item
 * @property {string} _id
 * @property {string} item
 * @property {string} name
 * @property {number} price
 */

/** @typedef {Omit<Item, "_id">} ItemPayload */

export const BACKEND_URL = "http://localhost:5000";

export const API_ENDPOINTS = {
  CHAT: "/api/chat",
};
