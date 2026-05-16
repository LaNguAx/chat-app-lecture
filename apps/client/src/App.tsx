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

    // STEP 10 TODO: also listen for NEW_MESSAGE, USER_JOINED, USER_LEFT,
    // and ERROR_MESSAGE. Update message/error state and pass it to ChatPanel.

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  function handleJoin(values: { username: string; room: string }) {
    setUsername(values.username);
    setRoom(values.room);
    setJoined(true);
    // STEP 6 TODO: emit SOCKET_EVENTS.JOIN_ROOM with `values`.
    // You will need to import SOCKET_EVENTS from @chat/shared.
    // Add the ROOM_JOINED listener in the useEffect above this function.
    // That listener should render payload.history and a small system
    // message like "You joined #room".
  }

  function handleLeave() {
    setJoined(false);
    // STEP 7 TODO: emit SOCKET_EVENTS.LEAVE_ROOM with { room, username }.
    // You will need SOCKET_EVENTS here too.
    // Also clear any local message state you add during the exercise.
  }

  function handleToggleConnection() {
    // STEP 8 TODO: if `socket.connected`, call socket.disconnect();
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
