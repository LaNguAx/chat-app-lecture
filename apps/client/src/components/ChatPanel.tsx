import type { ChatMessage } from "@chat/shared";
import { useEffect, useRef, useState, type FormEvent } from "react";

type SystemMessage = {
  kind: "system";
  id: string;
  text: string;
};

type RenderableMessage = (ChatMessage & { kind: "chat" }) | SystemMessage;

type Props = {
  username: string;
  room: string;
  messages: RenderableMessage[];
  error: string | null;
  onLeave: () => void;
  onSendMessage: (text: string) => void;
  onDismissError: () => void;
};

export default function ChatPanel({
  username,
  room,
  messages,
  error,
  onLeave,
  onSendMessage,
  onDismissError,
}: Props): JSX.Element {
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages]);

  function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (text.length === 0) return;
    onSendMessage(text);
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

      <div className="messages" ref={listRef}>
        {messages.map((m) =>
          m.kind === "system" ? (
            <div key={m.id} className="message message--system">
              {m.text}
            </div>
          ) : (
            <div key={m.id} className="message">
              <div className="message__meta">
                <strong>{m.username}</strong>
                {" · "}
                {new Date(m.createdAt).toLocaleTimeString()}
              </div>
              <div className="message__text">{m.text}</div>
            </div>
          )
        )}
      </div>

      {error ? (
        <div className="error" role="alert" onClick={onDismissError}>
          {error} <span style={{ opacity: 0.7 }}>(click to dismiss)</span>
        </div>
      ) : null}

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
