import {
  type ChatMessage,
  type RoomJoinedPayload,
  SOCKET_EVENTS,
  type UserPresencePayload,
} from "@chat/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import ChatPanel from "./components/ChatPanel.js";
import ConnectionStatus, {
  type ConnectionState,
} from "./components/ConnectionStatus.js";
import JoinForm from "./components/JoinForm.js";
import { socket } from "./lib/socket.js";

type SystemMessage = {
  kind: "system";
  id: string;
  text: string;
};

type RenderableMessage = (ChatMessage & { kind: "chat" }) | SystemMessage;

function toChatMessage(message: ChatMessage): RenderableMessage {
  return { ...message, kind: "chat" };
}

export default function App(): JSX.Element {
  const [connection, setConnection] = useState<ConnectionState>(
    socket.connected ? "connected" : "connecting"
  );
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<RenderableMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Keep a ref to the current room so callbacks defined inside effects
  // can filter events without re-subscribing on every state change.
  const roomRef = useRef("");
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  // Connection lifecycle. When the socket drops (manual Disconnect, tab
  // throttle, server restart) the user has no server-side room anymore,
  // so kick them back to the join form for a clean reconnect story.
  useEffect(() => {
    const handleConnect = () => setConnection("connected");
    const handleDisconnect = () => {
      setConnection("disconnected");
      setJoined(false);
      setMessages([]);
      setRoom("");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  // Chat events. Subscribe once and never tear down so we don't miss
  // events while the user is mid-render.
  useEffect(() => {
    const handleRoomJoined = (payload: RoomJoinedPayload) => {
      // Seed the message list with the server-replayed history first,
      // then a system separator marking where this user actually joined.
      // Live `new_message` events flow in afterwards.
      const history = payload.history.map(toChatMessage);
      const joinedSystem: RenderableMessage = {
        kind: "system",
        id: `joined-${payload.room}-${Date.now()}`,
        text: `You joined #${payload.room} as ${payload.username}.`,
      };
      setMessages([...history, joinedSystem]);
      setError(null);
    };

    const handleUserJoined = (payload: UserPresencePayload) => {
      if (payload.room !== roomRef.current) return;
      setMessages((prev) => [
        ...prev,
        {
          kind: "system",
          id: `userjoin-${payload.username}-${Date.now()}`,
          text: `${payload.username} joined the room.`,
        },
      ]);
    };

    const handleUserLeft = (payload: UserPresencePayload) => {
      if (payload.room !== roomRef.current) return;
      setMessages((prev) => [
        ...prev,
        {
          kind: "system",
          id: `userleft-${payload.username}-${Date.now()}`,
          text: `${payload.username} left the room.`,
        },
      ]);
    };

    const handleNewMessage = (payload: ChatMessage) => {
      if (payload.room !== roomRef.current) return;
      setMessages((prev) => [...prev, toChatMessage(payload)]);
    };

    const handleError = (payload: { message: string }) => {
      setError(payload.message);
    };

    socket.on(SOCKET_EVENTS.ROOM_JOINED, handleRoomJoined);
    socket.on(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
    socket.on(SOCKET_EVENTS.USER_LEFT, handleUserLeft);
    socket.on(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
    socket.on(SOCKET_EVENTS.ERROR_MESSAGE, handleError);

    return () => {
      socket.off(SOCKET_EVENTS.ROOM_JOINED, handleRoomJoined);
      socket.off(SOCKET_EVENTS.USER_JOINED, handleUserJoined);
      socket.off(SOCKET_EVENTS.USER_LEFT, handleUserLeft);
      socket.off(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
      socket.off(SOCKET_EVENTS.ERROR_MESSAGE, handleError);
    };
  }, []);

  const handleJoin = useCallback(
    (values: { username: string; room: string }) => {
      setUsername(values.username);
      setRoom(values.room);
      setJoined(true);
      setError(null);
      socket.emit(SOCKET_EVENTS.JOIN_ROOM, values);
    },
    []
  );

  const handleLeave = useCallback(() => {
    if (room && username) {
      // Tell the server we're leaving so it can broadcast `user_left`
      // to the remaining members of this room. The socket itself stays
      // connected — we just exit the room.
      socket.emit(SOCKET_EVENTS.LEAVE_ROOM, { room, username });
    }
    setJoined(false);
    setMessages([]);
    setRoom("");
  }, [room, username]);

  const handleToggleConnection = useCallback(() => {
    if (socket.connected) {
      socket.disconnect();
    } else {
      setConnection("connecting");
      socket.connect();
    }
  }, []);

  const handleSendMessage = useCallback(
    (text: string) => {
      socket.emit(SOCKET_EVENTS.SEND_MESSAGE, { room, username, text });
    },
    [room, username]
  );

  return (
    <div className="app">
      <header className="app__header">
        <h1>Socket.IO Chat</h1>
        <div className="app__header-controls">
          <ConnectionStatus state={connection} />
          <button
            type="button"
            className="button--ghost"
            onClick={handleToggleConnection}
            disabled={connection === "connecting"}
          >
            {connection === "connected" ? "Disconnect" : "Connect"}
          </button>
        </div>
      </header>

      {!joined ? (
        <JoinForm onJoin={handleJoin} disabled={connection !== "connected"} />
      ) : (
        <ChatPanel
          username={username}
          room={room}
          messages={messages}
          error={error}
          onLeave={handleLeave}
          onSendMessage={handleSendMessage}
          onDismissError={() => setError(null)}
        />
      )}
    </div>
  );
}
