// src/utils/socket.js
import { io } from "socket.io-client";
import { SOCKET_URL, API_BASE_URL } from '../lib/apiConfig';


// singleton socket instance
let socket = null;

/**
 * Initialize socket connection
 * @param {string} userId - the ID of the admin or user
 */
export const initSocket = (userId) => {
  if (socket) return socket; // reuse existing connection

  // Check if we are in the 'nas' environment based on API URL, since SOCKET_URL might be root
  const isProduction = API_BASE_URL.includes("/nas");

  console.log("Initializing Socket.IO Client (v4)...");

  socket = io(SOCKET_URL, {
    // Backend allows both websocket and polling. We enable both.
    transports: ["websocket", "polling"],
    // Pass userId in both auth and query to match backend logic:
    // "const { userId } = socket.handshake.auth || socket.handshake.query || {};"
    auth: { userId },
    query: { userId },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    timeout: 10000,
  });

  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("⚠️ Socket connection error:", err.message);
  });

  return socket;
};

/**
 * Get socket instance (after init)
 */
export const getSocket = () => socket;

/**
 * Disconnect socket manually (optional cleanup)
 */
export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
