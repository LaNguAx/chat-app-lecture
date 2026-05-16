import { randomUUID } from "node:crypto";
import type { Server as HttpServer } from "node:http";
import {
  type ChatMessage,
  type ClientToServerEvents,
  type JoinRoomPayload,
  type LeaveRoomPayload,
  type SendMessagePayload,
  type ServerToClientEvents,
  SOCKET_EVENTS,
  type TypingPayload,
} from "@chat/shared";
import { Server as SocketIOServer, type Socket } from "socket.io";
import { config } from "./config.js";
import { RoomHistory } from "./room-history.js";

/** Per-socket data we attach once the client has joined a room. */
type SocketSession = {
  username: string;
  room: string;
};

type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketSession
>;

type TypedIO = SocketIOServer<ClientToServerEvents, ServerToClientEvents>;

type ParseResult<T> = { ok: true; data: T } | { ok: false; reason: string };

/** Trim a value and return it only when it ends up non-empty. */
function nonEmpty(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function parseJoinPayload(payload: unknown): ParseResult<JoinRoomPayload> {
  if (typeof payload !== "object" || payload === null) {
    return { ok: false, reason: "Invalid join payload." };
  }
  const username = nonEmpty((payload as Record<string, unknown>).username);
  const room = nonEmpty((payload as Record<string, unknown>).room);
  if (!username) return { ok: false, reason: "Username is required." };
  if (!room) return { ok: false, reason: "Room is required." };
  return { ok: true, data: { username, room } };
}

function parseLeavePayload(payload: unknown): ParseResult<LeaveRoomPayload> {
  if (typeof payload !== "object" || payload === null) {
    return { ok: false, reason: "Invalid leave payload." };
  }
  const username = nonEmpty((payload as Record<string, unknown>).username);
  const room = nonEmpty((payload as Record<string, unknown>).room);
  if (!username || !room) {
    return { ok: false, reason: "Leave payload requires room and username." };
  }
  return { ok: true, data: { username, room } };
}

function parseSendPayload(payload: unknown): ParseResult<SendMessagePayload> {
  if (typeof payload !== "object" || payload === null) {
    return { ok: false, reason: "Invalid message payload." };
  }
  const username = nonEmpty((payload as Record<string, unknown>).username);
  const room = nonEmpty((payload as Record<string, unknown>).room);
  const text = nonEmpty((payload as Record<string, unknown>).text);
  if (!username || !room) {
    return { ok: false, reason: "Join a room before sending messages." };
  }
  if (!text) return { ok: false, reason: "Message text is required." };
  return { ok: true, data: { username, room, text } };
}

function parseTypingPayload(payload: unknown): TypingPayload | null {
  if (typeof payload !== "object" || payload === null) return null;
  const username = nonEmpty((payload as Record<string, unknown>).username);
  const room = nonEmpty((payload as Record<string, unknown>).room);
  if (!username || !room) return null;
  return { username, room };
}

/**
 * Make sure the socket only ever belongs to one chat room at a time. If
 * the user is in a room, leave it and broadcast `user_left` so the
 * remaining members of that room update their UI.
 *
 * `socket.leave` runs before the broadcast so the leaving client does
 * not receive its own `user_left` event.
 */
function leaveCurrentRoom(io: TypedIO, socket: TypedSocket) {
  const session = socket.data;
  if (!session?.room) return;
  const { room, username } = session;
  socket.leave(room);
  io.to(room).emit(SOCKET_EVENTS.USER_LEFT, { room, username });
  socket.data = undefined as unknown as SocketSession;
  console.log(`[socket] ${username} left ${room} (${socket.id})`);
}

export function createSocketServer(httpServer: HttpServer): TypedIO {
  const io: TypedIO = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents
  >(httpServer, {
    cors: {
      origin: config.clientOrigins,
      credentials: true,
    },
  });

  // In-memory chat history per room so a user joining mid-conversation
  // sees what was said before they arrived. Bounded buffer; for the
  // lecture this is intentionally not persisted across restarts.
  const history = new RoomHistory();

  io.on(SOCKET_EVENTS.CONNECTION, (socket: TypedSocket) => {
    console.log(`[socket] connected: ${socket.id}`);

    socket.on(SOCKET_EVENTS.JOIN_ROOM, (rawPayload) => {
      const parsed = parseJoinPayload(rawPayload);
      if (!parsed.ok) {
        socket.emit(SOCKET_EVENTS.ERROR_MESSAGE, { message: parsed.reason });
        return;
      }
      const { username, room } = parsed.data;

      leaveCurrentRoom(io, socket);
      socket.data = { username, room };
      socket.join(room);

      socket.emit(SOCKET_EVENTS.ROOM_JOINED, {
        room,
        username,
        history: history.get(room),
      });
      socket.to(room).emit(SOCKET_EVENTS.USER_JOINED, { room, username });
      console.log(`[socket] ${username} joined ${room} (${socket.id})`);
    });

    socket.on(SOCKET_EVENTS.LEAVE_ROOM, (rawPayload) => {
      const parsed = parseLeavePayload(rawPayload);
      if (!parsed.ok) {
        socket.emit(SOCKET_EVENTS.ERROR_MESSAGE, { message: parsed.reason });
        return;
      }
      const session = socket.data;
      if (!session || session.room !== parsed.data.room) {
        // Already not in the room they claim to be leaving — silently no-op.
        return;
      }
      leaveCurrentRoom(io, socket);
    });

    socket.on(SOCKET_EVENTS.SEND_MESSAGE, (rawPayload) => {
      const parsed = parseSendPayload(rawPayload);
      if (!parsed.ok) {
        socket.emit(SOCKET_EVENTS.ERROR_MESSAGE, { message: parsed.reason });
        return;
      }
      const { username, room, text } = parsed.data;

      const session = socket.data;
      if (!session || session.room !== room || session.username !== username) {
        socket.emit(SOCKET_EVENTS.ERROR_MESSAGE, {
          message: "You are not currently in that room.",
        });
        return;
      }

      const message: ChatMessage = {
        id: randomUUID(),
        room,
        username,
        text,
        createdAt: new Date().toISOString(),
      };
      history.append(room, message);
      io.to(room).emit(SOCKET_EVENTS.NEW_MESSAGE, message);
    });

    socket.on(SOCKET_EVENTS.TYPING_STARTED, (rawPayload) => {
      const payload = parseTypingPayload(rawPayload);
      if (!payload) return;
      socket.to(payload.room).emit(SOCKET_EVENTS.TYPING_STARTED, payload);
    });

    socket.on(SOCKET_EVENTS.TYPING_STOPPED, (rawPayload) => {
      const payload = parseTypingPayload(rawPayload);
      if (!payload) return;
      socket.to(payload.room).emit(SOCKET_EVENTS.TYPING_STOPPED, payload);
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log(`[socket] disconnected: ${socket.id} (${reason})`);
      leaveCurrentRoom(io, socket);
    });
  });

  return io;
}
