import { z } from "zod";

export const UserCreatedMessageSchema = z.object({
  userId: z.uuidv7(),
  email: z.email(),
  name: z.string(),
  personId: z.uuidv7(),
  occurredOn: z.string() // ISO Date
});

export type UserCreatedMessage = z.infer<typeof UserCreatedMessageSchema>;
