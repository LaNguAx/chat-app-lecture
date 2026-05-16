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
 * (message list, composer, typing area, error area) but does not yet
 * speak Socket.IO. Students wire the real event flow in the hands-on
 * exercise; see the README for the list of TODOs.
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
    // TODO (hands-on): emit SOCKET_EVENTS.SEND_MESSAGE with
    //   { room, username, text: draft.trim() }
    setDraft("");
  }

  function handleDraftChange(value: string) {
    setDraft(value);
    // TODO (hands-on, optional): emit SOCKET_EVENTS.TYPING_STARTED while typing,
    // then SOCKET_EVENTS.TYPING_STOPPED after a short pause / on send.
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
        {/* TODO (hands-on): render the seeded chat history (received via
            ROOM_JOINED.history) and any new messages received via
            SOCKET_EVENTS.NEW_MESSAGE. Both should look the same in the
            UI — the only difference is that history arrives in one batch
            on join. */}
        <div className="message message--system">
          No messages yet. The chat events are not wired up in this branch —
          implement them as part of the lecture exercise.
        </div>
      </div>

      <div className="typing">
        {/* TODO (hands-on, optional): show "alice is typing..." when other
            users in the room emit SOCKET_EVENTS.TYPING_STARTED. */}
      </div>

      {/* TODO (hands-on): render an error banner when the server emits
          SOCKET_EVENTS.ERROR_MESSAGE. */}

      <form className="composer" onSubmit={handleSend}>
        <input
          type="text"
          value={draft}
          onChange={(event) => handleDraftChange(event.target.value)}
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
