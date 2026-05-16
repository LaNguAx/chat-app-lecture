# Student Manual: Build the Socket.IO Chat

This guide is for the `start` branch. The project already has the React UI,
Express server, Socket.IO setup, and shared event names/types. Your job is only
to wire the core Socket.IO chat events.

Do the steps in order. Each step points to the exact file where the code goes.

## Event List

You will use these events from `packages/shared/src/socket-events.ts`:

- `join_room`
- `room_joined`
- `user_joined`
- `leave_room`
- `user_left`
- `send_message`
- `new_message`
- `error_message`

Socket.IO also gives us the built-in `connect` and `disconnect` lifecycle events.

## Step 1: Add Simple Server Memory

File: `apps/server/src/socket.ts`

Find the comment that starts with:

```ts
// STEP 1 TODO: create the tiny in-memory data structures you need:
```

Create two simple in-memory data structures:

- one `Map` to remember which `{ username, room }` belongs to each socket id
- one `Map` to store chat history per room

Keep this simple. Do not add a database.

You will also need imports for `randomUUID` from `node:crypto` and the shared
types/events you use from `@chat/shared`.

## Step 2: Server Handles `join_room`

File: `apps/server/src/socket.ts`

Find:

```ts
// STEP 2 TODO: handle SOCKET_EVENTS.JOIN_ROOM right here.
```

Inside the existing `io.on(SOCKET_EVENTS.CONNECTION, (socket) => { ... })`,
add a `socket.on(SOCKET_EVENTS.JOIN_ROOM, ...)` listener.

In that listener:

1. Read `username` and `room` from the payload.
2. Save `{ username, room }` for this socket id.
3. Call `socket.join(room)`.
4. Emit `SOCKET_EVENTS.ROOM_JOINED` back to this socket.
5. Include the room history in the `room_joined` payload.
6. Broadcast `SOCKET_EVENTS.USER_JOINED` to everyone else in the room.

## Step 3: Server Handles `leave_room`

File: `apps/server/src/socket.ts`

Find:

```ts
// STEP 3 TODO: handle SOCKET_EVENTS.LEAVE_ROOM right here.
```

Add a `socket.on(SOCKET_EVENTS.LEAVE_ROOM, ...)` listener.

In that listener:

1. Look up the room stored for this socket id.
2. Call `socket.leave(room)`.
3. Broadcast `SOCKET_EVENTS.USER_LEFT` to the remaining users in that room.
4. Remove this socket id from your session map.

This leaves the room without disconnecting the socket.

## Step 4: Server Handles `send_message`

File: `apps/server/src/socket.ts`

Find:

```ts
// STEP 4 TODO: handle SOCKET_EVENTS.SEND_MESSAGE right here.
```

Add a `socket.on(SOCKET_EVENTS.SEND_MESSAGE, ...)` listener.

In that listener:

1. Read `username`, `room`, and `text` from the payload.
2. Create a `ChatMessage`.
3. Add it to that room's history array.
4. Emit `SOCKET_EVENTS.NEW_MESSAGE` to everyone in that room.

Use `crypto.randomUUID()` for the message id and `new Date().toISOString()` for
`createdAt`.

## Step 5: Server Handles Disconnects

File: `apps/server/src/socket.ts`

Find the existing:

```ts
socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
```

Inside it:

1. Check whether this socket id is still in a room.
2. If yes, broadcast `SOCKET_EVENTS.USER_LEFT` to the remaining room users.
3. Remove this socket id from your session map.

This covers closed tabs, browser refreshes, and the Disconnect button.

## Step 6: Client Emits `join_room`

File: `apps/client/src/App.tsx`

Find:

```ts
function handleJoin(values: { username: string; room: string }) {
```

Inside that function, emit `SOCKET_EVENTS.JOIN_ROOM` with `values`.

Then add a `ROOM_JOINED` listener in the `useEffect` near the top of the file.
That listener should:

1. Mark the user as joined.
2. Render the history from `payload.history`.
3. Add a small system message like `You joined #room`.

Starter note: the starter currently calls `setJoined(true)` immediately so you
can see the chat shell. When you wire the real event flow, move that final
"joined" state update into the `ROOM_JOINED` listener.

You will need to import `SOCKET_EVENTS` from `@chat/shared`.

## Step 7: Client Emits `leave_room`

File: `apps/client/src/App.tsx`

Find:

```ts
function handleLeave() {
```

Inside that function:

1. Emit `SOCKET_EVENTS.LEAVE_ROOM` with `{ room, username }`.
2. Clear the current room state.
3. Clear any messages state you added.
4. Show the join form again.

## Step 8: Client Connect / Disconnect Button

File: `apps/client/src/App.tsx`

Find:

```ts
function handleToggleConnection() {
```

Inside that function:

1. If `socket.connected` is true, call `socket.disconnect()`.
2. Otherwise, call `socket.connect()`.

When disconnected, the user should need to join a room again after reconnecting.

## Step 9: Client Emits `send_message`

File: `apps/client/src/components/ChatPanel.tsx`

Find:

```ts
function handleSend(event: FormEvent<HTMLFormElement>) {
```

Inside that function, emit `SOCKET_EVENTS.SEND_MESSAGE` with:

```ts
{ room, username, text: draft.trim() }
```

Keep the existing empty-message guard.

You will need to import `SOCKET_EVENTS` from `@chat/shared` and `socket` from
`../lib/socket.js`.

## Step 10: Client Listens for Chat Events

File: `apps/client/src/App.tsx`

In the main `useEffect`, add listeners for:

- `SOCKET_EVENTS.NEW_MESSAGE`
- `SOCKET_EVENTS.USER_JOINED`
- `SOCKET_EVENTS.USER_LEFT`
- `SOCKET_EVENTS.ERROR_MESSAGE`

Use these listeners to update React state.

Then pass that state into `ChatPanel`.

## Step 11: Render Messages

File: `apps/client/src/components/ChatPanel.tsx`

Find:

```tsx
<div className="messages">
```

Replace the placeholder message with a `.map(...)` over your messages state.

Render:

- normal chat messages from `new_message` and `room_joined.history`
- small system messages from `user_joined`, `user_left`, and `room_joined`
- an error banner for `error_message`

## Step 12: Test With Two Browser Tabs

Run:

```bash
npm run dev
```

Open `http://localhost:5173` in two browser tabs.

Test in this order:

1. Join the same room in both tabs with different usernames.
2. Send a message from tab A.
3. Confirm tab B sees it immediately.
4. Send a message from tab B.
5. Click Leave in tab B.
6. Confirm tab A sees that tab B left.
7. Rejoin the room in tab B.
8. Confirm tab B receives the existing room history.
9. Click Disconnect and Connect to see the lifecycle behavior.

## What Not To Build

Do not build these during the lecture:

- authentication
- database persistence
- typing indicators
- private messages
- message deletion
- complex validation
- deployment

The point is to understand the core Socket.IO room flow.
