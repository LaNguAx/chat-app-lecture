import { z } from "zod";

function requiredTrimmedString(error: string) {
  return z.string({ error }).trim().min(1, { error });
}

const username = requiredTrimmedString("Username is required.");
const room = requiredTrimmedString("Room is required.");

export const ChatMessageSchema = z.object({
  id: requiredTrimmedString("Message id is required."),
  room,
  username,
  text: requiredTrimmedString("Message text is required."),
  createdAt: z.iso.datetime({ error: "Message timestamp must be ISO 8601." }),
});

export const JoinRoomPayloadSchema = z.object({
  room,
  username,
});

export const LeaveRoomPayloadSchema = z.object({
  room,
  username,
});

export const SendMessagePayloadSchema = z.object({
  room,
  username,
  text: requiredTrimmedString("Message text is required."),
});

export const TypingPayloadSchema = z.object({
  room,
  username,
});

export const RoomJoinedPayloadSchema = z.object({
  room,
  username,
  history: z.array(ChatMessageSchema),
});

export const UserPresencePayloadSchema = z.object({
  room,
  username,
});

export const ErrorMessagePayloadSchema = z.object({
  message: requiredTrimmedString("Error message is required."),
});
