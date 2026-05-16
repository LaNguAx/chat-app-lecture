/**
 * Shared Socket.IO event names and payload types.
 *
 * Used on both the client and the server so the two sides agree on the
 * wire format. Students implement the event handlers themselves in the
 * `final` branch; the names and shapes live here so nobody has to invent
 * them mid-exercise.
 */

export const SOCKET_EVENTS = {
  // Native Socket.IO lifecycle events. Re-exported as constants so client
  // and server code reads consistently.
  CONNECTION: "connection",
  DISCONNECT: "disconnect",

  // Application events for this lecture.
  JOIN_ROOM: "join_room",
  ROOM_JOINED: "room_joined",
  USER_JOINED: "user_joined",
  USER_LEFT: "user_left",
  SEND_MESSAGE: "send_message",
  NEW_MESSAGE: "new_message",
  TYPING_STARTED: "typing_started",
  TYPING_STOPPED: "typing_stopped",
  ERROR_MESSAGE: "error_message",
} as const;

export type SocketEventName = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

/** A chat message broadcast to everyone in a room. */
export type ChatMessage = {
  id: string;
  room: string;
  username: string;
  text: string;
  /** ISO 8601 timestamp. */
  createdAt: string;
};

/** Payload sent by a client when it wants to join a room. */
export type JoinRoomPayload = {
  room: string;
  username: string;
};

/** Server confirmation that the client successfully joined a room. */
export type RoomJoinedPayload = {
  room: string;
  username: string;
};

/** Lightweight notification when another user joins or leaves a room. */
export type UserPresencePayload = {
  room: string;
  username: string;
};

/** Payload sent by a client when it submits a new message. */
export type SendMessagePayload = {
  room: string;
  username: string;
  text: string;
};

/** Payload broadcast by the server while a user is typing. */
export type TypingPayload = {
  room: string;
  username: string;
};

/** Payload broadcast by the server when a client sends invalid input. */
export type ErrorMessagePayload = {
  message: string;
};

/**
 * Strongly typed events the server emits to clients.
 *
 * Pass to `Server<ClientToServerEvents, ServerToClientEvents>` on the
 * server and `Socket<ServerToClientEvents, ClientToServerEvents>` on the
 * client to get full type safety on `emit` / `on`.
 */
export type ServerToClientEvents = {
  [SOCKET_EVENTS.ROOM_JOINED]: (payload: RoomJoinedPayload) => void;
  [SOCKET_EVENTS.USER_JOINED]: (payload: UserPresencePayload) => void;
  [SOCKET_EVENTS.USER_LEFT]: (payload: UserPresencePayload) => void;
  [SOCKET_EVENTS.NEW_MESSAGE]: (payload: ChatMessage) => void;
  [SOCKET_EVENTS.TYPING_STARTED]: (payload: TypingPayload) => void;
  [SOCKET_EVENTS.TYPING_STOPPED]: (payload: TypingPayload) => void;
  [SOCKET_EVENTS.ERROR_MESSAGE]: (payload: ErrorMessagePayload) => void;
};

/** Strongly typed events the client emits to the server. */
export type ClientToServerEvents = {
  [SOCKET_EVENTS.JOIN_ROOM]: (payload: JoinRoomPayload) => void;
  [SOCKET_EVENTS.SEND_MESSAGE]: (payload: SendMessagePayload) => void;
  [SOCKET_EVENTS.TYPING_STARTED]: (payload: TypingPayload) => void;
  [SOCKET_EVENTS.TYPING_STOPPED]: (payload: TypingPayload) => void;
};
