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
    // The server should answer with SOCKET_EVENTS.ROOM_JOINED.
  }

  function handleLeave() {
    setJoined(false);
    // TODO (hands-on, optional): emit a leave event or rejoin a new room.
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>Socket.IO Chat</h1>
        <ConnectionStatus state={connection} />
      </header>

      {!joined ? (
        <JoinForm onJoin={handleJoin} />
      ) : (
        <ChatPanel username={username} room={room} onLeave={handleLeave} />
      )}
    </div>
  );
}
