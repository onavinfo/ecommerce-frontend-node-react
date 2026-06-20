// client/src/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "https://ecommerce-backend-node-demo.netlify.app";

export const socket = io(SOCKET_URL, {
  autoConnect: false,           // you connect manually in component
  transports: ["websocket", "polling"],
  withCredentials: true,
});
