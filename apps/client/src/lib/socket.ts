import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@chat/shared";
import { io, type Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3000";

/**
 * Shared, application-wide Socket.IO client.
 *
 * The connection is established eagerly; the React tree listens for
 * lifecycle and chat events via the typed `ServerToClientEvents`.
 */
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  SOCKET_URL,
  {
    autoConnect: true,
    transports: ["websocket"],
  }
);
