import type { Server as HttpServer } from "node:http";
import {
  type ClientToServerEvents,
  type ServerToClientEvents,
  SOCKET_EVENTS,
} from "@chat/shared";
import { Server as SocketIOServer } from "socket.io";
import { config } from "./config.js";

/**
 * Attach a Socket.IO server to the existing HTTP server.
 *
 * In the START branch we only wire up the connection lifecycle. The
 * chat event handlers (join_room, send_message, typing, ...) are left
 * as TODOs for students to implement during the hands-on exercise.
 */
export function createSocketServer(httpServer: HttpServer): SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents
> {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(
    httpServer,
    {
      cors: {
        origin: config.clientOrigins,
        credentials: true,
      },
    }
  );

  // TODO (hands-on): keep a per-room chat history so a user who joins an
  // in-progress conversation can be sent the existing messages via
  // ROOM_JOINED.history. A simple `Map<string, ChatMessage[]>` capped at
  // a sensible size (e.g. 100 entries / room) is enough for the lecture.

  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    // TODO (hands-on): listen for SOCKET_EVENTS.JOIN_ROOM
    //   - validate the payload with JoinRoomPayloadSchema.safeParse(...)
    //   - join the socket to a Socket.IO room
    //   - store username + room on the socket for later use
    //   - emit SOCKET_EVENTS.ROOM_JOINED back to the joining client,
    //     INCLUDING the room's existing chat history so they can see
    //     messages that were sent before they arrived.
    //   - broadcast SOCKET_EVENTS.USER_JOINED to the other room members

    // TODO (hands-on): listen for SOCKET_EVENTS.LEAVE_ROOM
    //   - validate the payload with LeaveRoomPayloadSchema.safeParse(...)
    //   - check that the socket is actually in that room
    //   - call socket.leave(room) (do NOT disconnect the socket)
    //   - broadcast SOCKET_EVENTS.USER_LEFT to the remaining members so
    //     they see the system message in real time.
    //   - clear the username/room you stored on the socket

    // TODO (hands-on): listen for SOCKET_EVENTS.SEND_MESSAGE
    //   - validate the payload with SendMessagePayloadSchema.safeParse(...)
    //   - build a ChatMessage object with id + createdAt
    //   - append it to the room's chat history (so future joiners see it)
    //   - broadcast SOCKET_EVENTS.NEW_MESSAGE to everyone in the room

    // TODO (hands-on, optional): listen for typing_started / typing_stopped
    //   - validate typing payloads with TypingPayloadSchema.safeParse(...)
    //   - broadcast typing state to the other room members

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log(`[socket] disconnected: ${socket.id} (${reason})`);
      // TODO (hands-on): if the socket was still in a room (i.e. the user
      // closed the tab or hit "Disconnect" without leaving first),
      // broadcast SOCKET_EVENTS.USER_LEFT so the remaining members know.
    });
  });

  return io;
}
