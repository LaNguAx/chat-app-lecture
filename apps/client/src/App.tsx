import { useEffect, useState } from "react";
import ChatPanel from "./components/ChatPanel.js";
import ConnectionStatus, {
  type ConnectionState,
} from "./components/ConnectionStatus.js";
import JoinForm from "./components/JoinForm.js";
import { socket } from "./lib/socket.js";

export default function App(): JSX.Element {
  const [connection, setConnection] = useState<ConnectionState>(
    socket.connected ? "connected" : "connecting"
  );
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const handleConnect = () => setConnection("connected");
    const handleDisconnect = () => setConnection("disconnected");

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  function handleJoin(values: { username: string; room: string }) {
    setUsername(values.username);
    setRoom(values.room);
    setJoined(true);
    // TODO (hands-on): emit SOCKET_EVENTS.JOIN_ROOM with `values`.
    // The server should answer with SOCKET_EVENTS.ROOM_JOINED, whose
    // payload includes the room's chat `history` (messages sent before
    // this user joined). Render that history so a late joiner sees what
    // happened before they arrived.
  }

  function handleLeave() {
    setJoined(false);
    // TODO (hands-on): emit SOCKET_EVENTS.LEAVE_ROOM with { room, username }
    // so the server can broadcast USER_LEFT to the remaining members of
    // the room. Clearing local chat state (messages / typing) belongs
    // here too — leaving a room should look like a fresh start.
  }

  // TODO (hands-on): wire up a connect/disconnect toggle button.
  //   - When connected, calling `socket.disconnect()` simulates the user
  //     going offline (server emits "disconnect", which should broadcast
  //     USER_LEFT to the room).
  //   - When disconnected, calling `socket.connect()` re-establishes the
  //     connection. After reconnecting, the user is no longer in any
  //     server-side room and must JOIN_ROOM again.

  function handleToggleConnection() {
    // TODO (hands-on): if `socket.connected`, call socket.disconnect();
    // otherwise call socket.connect().
  }

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
          >
            {connection === "connected" ? "Disconnect" : "Connect"}
          </button>
        </div>
      </header>

      {!joined ? (
        <JoinForm onJoin={handleJoin} />
      ) : (
        <ChatPanel username={username} room={room} onLeave={handleLeave} />
      )}
    </div>
  );
}
