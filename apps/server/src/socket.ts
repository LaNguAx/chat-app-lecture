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
 * chat event handlers are left as TODOs for students to implement during
 * the hands-on exercise.
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

  // STEP 1 TODO: create the tiny in-memory data structures you need:
  //   - a place to remember each socket's current { username, room }
  //   - a Map<string, ChatMessage[]> for per-room chat history
  // Keep this simple. No database, no auth, no validation library.

  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    // STEP 2 TODO: handle SOCKET_EVENTS.JOIN_ROOM right here.
    //   1. Read { username, room } from the payload.
    //   2. Store { username, room } for this socket.
    //   3. Call socket.join(room).
    //   4. Emit SOCKET_EVENTS.ROOM_JOINED back to this socket with:
    //      { username, room, history: roomHistory.get(room) ?? [] }
    //   5. Broadcast SOCKET_EVENTS.USER_JOINED to everyone else in the room.

    // STEP 3 TODO: handle SOCKET_EVENTS.LEAVE_ROOM right here.
    //   1. Look up the room stored for this socket.
    //   2. Call socket.leave(room). Do not disconnect the socket.
    //   3. Broadcast SOCKET_EVENTS.USER_LEFT to the remaining room members.
    //   4. Clear the stored room/user for this socket.

    // STEP 4 TODO: handle SOCKET_EVENTS.SEND_MESSAGE right here.
    //   1. Read { username, room, text } from the payload.
    //   2. Create a ChatMessage with id, room, username, text, createdAt.
    //   3. Add the message to that room's history array.
    //   4. Emit SOCKET_EVENTS.NEW_MESSAGE to everyone in the room.

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log(`[socket] disconnected: ${socket.id} (${reason})`);
      // STEP 5 TODO: if this socket was still in a room, broadcast
      // SOCKET_EVENTS.USER_LEFT to the remaining room members.
    });
  });

  return io;
}
