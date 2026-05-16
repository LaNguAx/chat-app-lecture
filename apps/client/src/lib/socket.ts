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

// TODO (hands-on): emit SOCKET_EVENTS.JOIN_ROOM with { username, room }
//   The server will validate this payload with the shared Zod schema.
// TODO (hands-on): emit SOCKET_EVENTS.LEAVE_ROOM with { username, room } when the
//   user clicks "Leave" so the server can broadcast USER_LEFT without
//   tearing down the underlying socket.
// TODO (hands-on): emit SOCKET_EVENTS.SEND_MESSAGE with { username, room, text }
//   The server will trim and validate the message with the shared Zod schema.
// TODO (hands-on): listen for SOCKET_EVENTS.ROOM_JOINED and seed the message
//   list with `payload.history` so a user joining an existing room sees
//   the messages that were sent before they arrived.
// TODO (hands-on): listen for SOCKET_EVENTS.NEW_MESSAGE and append messages to state
// TODO (hands-on): listen for SOCKET_EVENTS.USER_JOINED / USER_LEFT to render system messages
// TODO (hands-on, optional): emit and listen for typing_started / typing_stopped
// TODO (hands-on): listen for SOCKET_EVENTS.ERROR_MESSAGE and surface to the UI
// TODO (hands-on): expose a connect/disconnect toggle in the UI that calls
//   `socket.connect()` / `socket.disconnect()`. Useful for demonstrating
//   the lifecycle live during the lecture.
