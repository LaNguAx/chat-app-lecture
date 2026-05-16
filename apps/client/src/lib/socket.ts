import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@chat/shared";
import { io, type Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3000";

/**
 * Shared Socket.IO client instance.
 *
 * We create it eagerly so any component can import it without worrying
 * about wiring. In the START branch the connection is the only thing
 * that actually works — the chat-specific events are left as TODOs for
 * the hands-on section.
 */
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  SOCKET_URL,
  {
    autoConnect: true,
    transports: ["websocket"],
  }
);

// Event wiring belongs in App.tsx and ChatPanel.tsx, not in this setup file.
// Keep this file focused: it creates and exports the shared Socket.IO client.
