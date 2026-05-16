import { useState, type FormEvent } from "react";

type Props = {
  onJoin: (values: { username: string; room: string }) => void;
};

export default function JoinForm({ onJoin }: Props): JSX.Element {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");

  const canSubmit = username.trim().length > 0 && room.trim().length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    onJoin({ username: username.trim(), room: room.trim() });
  }

  return (
    <form className="app__join" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="e.g. alice"
          autoComplete="off"
        />
      </div>
      <div className="field">
        <label htmlFor="room">Room</label>
        <input
          id="room"
          type="text"
          value={room}
          onChange={(event) => setRoom(event.target.value)}
          placeholder="e.g. lecture-101"
          autoComplete="off"
        />
      </div>
      <button type="submit" disabled={!canSubmit}>
        Join room
      </button>
    </form>
  );
}
