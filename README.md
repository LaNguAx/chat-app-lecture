# Socket.IO Chat — Lecture Project (final)

A small real-time chat application built as a TypeScript monorepo. This
is the **completed** branch: the chat events are fully wired up so you
can use it as a reference after working through the exercise on
[`start`](https://github.com/LaNguAx/chat-app-lecture/tree/start).

```
apps/
  client/    React + Vite + TypeScript frontend
  server/    Node.js + Express + Socket.IO backend
packages/
  shared/    Shared event names, Zod schemas, and inferred payload types
```

## Branches

| Branch  | Use for                                                       |
| ------- | ------------------------------------------------------------- |
| `main`  | Same as `start`. The initial state of the project.            |
| `start` | Student starting point. Setup + UI shell, no chat logic yet.  |
| `final` | **This branch.** Completed real-time chat.                    |

Students implementing the exercise should follow **[STUDENT_MANUAL.md](STUDENT_MANUAL.md)** on the `start` branch.

## Requirements

- Node.js >= 20.10
- npm >= 10 (ships with Node)

## Install

```bash
npm install
```

## Run

```bash
cp .env.example .env
npm run dev
```

- Backend listens on `http://localhost:3000`
- Frontend listens on `http://localhost:5173`
- Open two browser tabs to chat with yourself.

## Environment variables

See `.env.example`. Defaults work out of the box for local development.

| Variable          | Used by  | Purpose                                                  |
| ----------------- | -------- | -------------------------------------------------------- |
| `SERVER_PORT`     | server   | HTTP/Socket.IO port (default `3000`).                    |
| `CLIENT_URL`      | server   | Comma-separated CORS origins (default `http://localhost:5173`). |
| `VITE_SOCKET_URL` | client   | URL the browser connects to (default `http://localhost:3000`).  |

## Project scripts

```bash
npm run dev          # run client + server together
npm run build        # type-check + build both apps
npm run typecheck    # type-check shared, server, and client
```

## What's implemented

End-to-end with Socket.IO rooms:

- Connection status (connected / connecting / disconnected).
- **Connect / Disconnect button** in the header that calls
  `socket.connect()` / `socket.disconnect()` so the lifecycle and the
  resulting `user_left` broadcast are visible during the lecture.
- `join_room`: client emits, server validates with shared Zod schemas, joins the Socket.IO room,
  stores `{ username, room }` on the socket, replies with `room_joined`,
  broadcasts `user_joined` to other room members.
- **Chat history on join**: server keeps a per-room, in-memory, capped
  message buffer (`apps/server/src/room-history.ts`). `room_joined`
  carries `history: ChatMessage[]`, and the client seeds its message
  list with that history so a user joining mid-conversation sees what
  was said before they arrived.
- `send_message`: client emits, server validates with Zod and checks against the stored
  session, creates a `ChatMessage` with `id` + `createdAt`, appends it
  to the room history, and broadcasts `new_message` to everyone in the
  room.
- **Explicit room exit** (`leave_room`): client emits when the user
  clicks "Leave"; server broadcasts `user_left` to the remaining
  members and removes the socket from the room **without** disconnecting
  it. The user can then join a different room without reconnecting.
- `user_left` is also broadcast on socket `disconnect` (closed tab,
  network drop, "Disconnect" button) and when the user joins a
  different room (a socket is only ever in one room at a time).
- `error_message`: server reports Zod validation errors back to the offending
  client; the UI surfaces them in an error banner.

Event names and payload types live in
[`packages/shared/src/socket-events.ts`](packages/shared/src/socket-events.ts)
and Zod schemas live in
[`packages/shared/src/socket-schemas.ts`](packages/shared/src/socket-schemas.ts).
Types are inferred from the schemas, so the runtime checks and TypeScript
contract stay aligned.

## Where the code lives

- Client socket setup: [`apps/client/src/lib/socket.ts`](apps/client/src/lib/socket.ts)
- Client UI + state: [`apps/client/src/App.tsx`](apps/client/src/App.tsx) and `apps/client/src/components/`
- Server socket handlers: [`apps/server/src/socket.ts`](apps/server/src/socket.ts)
- Server room history: [`apps/server/src/room-history.ts`](apps/server/src/room-history.ts)
- Server HTTP + boot: [`apps/server/src/app.ts`](apps/server/src/app.ts), [`apps/server/src/index.ts`](apps/server/src/index.ts)
