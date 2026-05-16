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
  shared/    Shared TypeScript event names and payload types
```

## Branches

| Branch  | Use for                                                       |
| ------- | ------------------------------------------------------------- |
| `main`  | Same as `start`. The initial state of the project.            |
| `start` | Student starting point. Setup + UI shell, no chat logic yet.  |
| `final` | **This branch.** Completed real-time chat.                    |

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
- `join_room`: client emits, server validates, joins the Socket.IO room,
  stores `{ username, room }` on the socket, replies with `room_joined`,
  broadcasts `user_joined` to other room members.
- `send_message`: client emits, server validates against the stored
  session, creates a `ChatMessage` with `id` + `createdAt`, broadcasts
  `new_message` to everyone in the room.
- `user_left`: broadcast on disconnect or when the user joins a different
  room (a socket is only ever in one room at a time).
- `typing_started` / `typing_stopped`: simple typing indicator with a
  client-side idle timeout.
- `error_message`: server reports validation errors back to the offending
  client; the UI surfaces them in an error banner.

Event names and payload types live in
[`packages/shared/src/socket-events.ts`](packages/shared/src/socket-events.ts)
and are imported on both sides, so the contract is the same on the wire.

## Where the code lives

- Client socket setup: [`apps/client/src/lib/socket.ts`](apps/client/src/lib/socket.ts)
- Client UI + state: [`apps/client/src/App.tsx`](apps/client/src/App.tsx) and `apps/client/src/components/`
- Server socket handlers: [`apps/server/src/socket.ts`](apps/server/src/socket.ts)
- Server HTTP + boot: [`apps/server/src/app.ts`](apps/server/src/app.ts), [`apps/server/src/index.ts`](apps/server/src/index.ts)
