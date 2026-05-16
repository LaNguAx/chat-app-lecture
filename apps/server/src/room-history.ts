import type { ChatMessage } from "@chat/shared";

/**
 * In-memory, capped, per-room chat history.
 *
 * Used so a client that joins an existing room can immediately see the
 * messages that were sent before they arrived (delivered as
 * `room_joined.history`). The lecture explicitly avoids a database to
 * keep moving parts to a minimum; if you outgrow this, swap the `Map`
 * for Redis / Postgres without touching the socket layer.
 */
export class RoomHistory {
  private readonly rooms = new Map<string, ChatMessage[]>();

  constructor(private readonly limitPerRoom = 100) {}

  /** Returns a fresh array snapshot, safe for the caller to keep / mutate. */
  get(room: string): ChatMessage[] {
    const list = this.rooms.get(room);
    return list ? list.slice() : [];
  }

  /** Append a message and trim to the most recent `limitPerRoom` entries. */
  append(room: string, message: ChatMessage): void {
    const list = this.rooms.get(room) ?? [];
    list.push(message);
    if (list.length > this.limitPerRoom) {
      list.splice(0, list.length - this.limitPerRoom);
    }
    this.rooms.set(room, list);
  }
}
