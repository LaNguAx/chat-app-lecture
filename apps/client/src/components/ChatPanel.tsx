import { useState, type FormEvent } from "react";

type Props = {
  username: string;
  room: string;
  onLeave: () => void;
};

/**
 * Chat panel shell.
 *
 * In the START branch this is intentionally inert: it renders the UI
 * (message list, composer, error area) but does not yet speak Socket.IO.
 * Students wire the real event flow in the hands-on exercise; see the
 * README and docs/STUDENT_MANUAL.md for the exact order.
 */
export default function ChatPanel({
  username,
  room,
  onLeave,
}: Props): JSX.Element {
  const [draft, setDraft] = useState("");

  function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.trim().length === 0) return;
    // STEP 9 TODO: emit SOCKET_EVENTS.SEND_MESSAGE with:
    //   { room, username, text: draft.trim() }
    // You will need to import SOCKET_EVENTS and the shared socket client.
    setDraft("");
  }

  return (
    <section className="app__chat">
      <div className="room-banner">
        <span>
          Signed in as <strong>{username}</strong> in room <strong>{room}</strong>
        </span>
        <button type="button" className="button--ghost" onClick={onLeave}>
          Leave
        </button>
      </div>

      <div className="messages">
        {/* STEP 10 TODO: render messages here.
            - ROOM_JOINED gives you payload.history.
            - NEW_MESSAGE gives you one new message at a time.
            - USER_JOINED / USER_LEFT can become small system messages. */}
        <div className="message message--system">
          No messages yet. The chat events are not wired up in this branch —
          implement them as part of the lecture exercise.
        </div>
      </div>

      {/* STEP 11 TODO: render an error banner when the server emits
          SOCKET_EVENTS.ERROR_MESSAGE. */}

      <form className="composer" onSubmit={handleSend}>
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type a message and hit enter"
          autoComplete="off"
        />
        <button type="submit" disabled={draft.trim().length === 0}>
          Send
        </button>
      </form>
    </section>
  );
}
