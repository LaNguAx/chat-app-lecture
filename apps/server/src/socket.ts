import { randomUUID } from "node:crypto";
import type { Server as HttpServer } from "node:http";
import {
  type ChatMessage,
  type ClientToServerEvents,
  type JoinRoomPayload,
  type SendMessagePayload,
  type ServerToClientEvents,
  SOCKET_EVENTS,
  type TypingPayload,
} from "@chat/shared";
import { Server as SocketIOServer, type Socket } from "socket.io";
import { config } from "./config.js";

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

/** Trim a value and return it only when it ends up non-empty. */
function nonEmpty(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function parseJoinPayload(
  payload: unknown
): { ok: true; data: JoinRoomPayload } | { ok: false; reason: string } {
  if (typeof payload !== "object" || payload === null) {
    return { ok: false, reason: "Invalid join payload." };
  }
  const username = nonEmpty((payload as Record<string, unknown>).username);
  const room = nonEmpty((payload as Record<string, unknown>).room);
  if (!username) return { ok: false, reason: "Username is required." };
  if (!room) return { ok: false, reason: "Room is required." };
  return { ok: true, data: { username, room } };
}

function parseSendPayload(
  payload: unknown
): { ok: true; data: SendMessagePayload } | { ok: false; reason: string } {
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
 * the user already joined a different room, leave it and let the others
 * know.
 */
function leaveCurrentRoom(io: TypedIO, socket: TypedSocket) {
  const session = socket.data;
  if (!session?.room) return;
  socket.leave(session.room);
  io.to(session.room).emit(SOCKET_EVENTS.USER_LEFT, {
    room: session.room,
    username: session.username,
  });
  socket.data = undefined as unknown as SocketSession;
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

      socket.emit(SOCKET_EVENTS.ROOM_JOINED, { room, username });
      socket.to(room).emit(SOCKET_EVENTS.USER_JOINED, { room, username });
      console.log(`[socket] ${username} joined ${room} (${socket.id})`);
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
