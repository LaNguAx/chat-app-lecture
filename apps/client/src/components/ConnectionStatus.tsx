export type ConnectionState = "connected" | "connecting" | "disconnected";

const LABEL: Record<ConnectionState, string> = {
  connected: "Connected",
  connecting: "Connecting...",
  disconnected: "Disconnected",
};

export default function ConnectionStatus({
  state,
}: {
  state: ConnectionState;
}): JSX.Element {
  return <span className={`status status--${state}`}>{LABEL[state]}</span>;
}
