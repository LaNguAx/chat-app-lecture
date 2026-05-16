# Socket.IO Chat — Lecture Project

A small real-time chat application built as a TypeScript monorepo. It is
designed for a hands-on WebSockets / Socket.IO lecture: the `start`
branch contains the scaffolding (UI, server, shared types, dependencies)
and the `final` branch contains the completed implementation.

```
apps/
  client/    React + Vite + TypeScript frontend
  server/    Node.js + Express + Socket.IO backend
packages/
  shared/    Shared Socket.IO event names and payload types
```

## Branches

| Branch  | Use for                                                       |
| ------- | ------------------------------------------------------------- |
| `main`  | Same as `start`. The initial state of the project.            |
| `start` | **Where students begin.** Setup + UI shell, no chat logic yet. |
| `final` | Completed real-time chat. Use for reference after the session. |

Switch to the starting point:

```bash
git checkout start
```

Students implementing the exercise should follow **[STUDENT_MANUAL.md](STUDENT_MANUAL.md)** on the `start` branch.

## Requirements

- Node.js >= 20.10
- npm >= 10 (ships with Node)

## Install

From the repo root (npm workspaces install every workspace at once):

```bash
npm install
```

## Run (frontend + backend together)

```bash
cp .env.example .env
npm run dev
```

- Backend listens on `http://localhost:3000`
- Frontend listens on `http://localhost:5173`
- Open the frontend in two browser tabs to chat with yourself once the
  events are implemented.

To run them independently:

```bash
npm run dev:server
npm run dev:client
```

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

## Hands-on TODOs

In the exercise, we will implement:

- Client emits `join_room`
- Server listens to `join_room`
- Server joins the socket into a Socket.IO room
- Client emits `send_message`
- Server broadcasts `new_message` to the room
- Client listens for `new_message`
- Server broadcasts `user_joined` to the room
- **Explicit room exit**: client emits `leave_room` when the user clicks
  "Leave"; server broadcasts `user_left` to the remaining members of
  that room (without disconnecting the socket).
- Server also broadcasts `user_left` on socket `disconnect` (closed tab,
  network drop, "Disconnect" button).
- **Connect / disconnect button**: a UI toggle that calls
  `socket.connect()` / `socket.disconnect()` so students can see the
  lifecycle and the resulting `user_left` broadcast live.
- **Chat history on join**: server keeps a per-room message buffer and
  sends it to a new joiner inside `room_joined.history`; the client
  renders that history so a late joiner sees what was said before they
  arrived.
- Simple error feedback via `error_message`

All of the event names and payload types are already defined in
[`packages/shared/src/socket-events.ts`](packages/shared/src/socket-events.ts).
The goal of the lecture is to wire up those events on the client and server.
The starter does not ask you to build validation; the `final` branch shows
one clean way to add production-style validation after the core Socket.IO
flow is working.

Where to look:

- Client socket setup: [`apps/client/src/lib/socket.ts`](apps/client/src/lib/socket.ts)
- Client UI: [`apps/client/src/App.tsx`](apps/client/src/App.tsx) and `apps/client/src/components/`
- Server socket setup: [`apps/server/src/socket.ts`](apps/server/src/socket.ts)
  - **Step-by-step guide:** [`STUDENT_MANUAL.md`](STUDENT_MANUAL.md)

Each file above contains `STEP N TODO` comments that match the manual.
Work through the steps in order (server first, then client).

## After the session

```bash
git checkout final
npm install
npm run dev
```

Then compare your code against the `final` branch.
