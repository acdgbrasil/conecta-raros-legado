import { z } from "zod";

export const UpdateUserStatusSchema = z.object({
  userId: z.uuidv7(),
  isActive: z.boolean()
});

export type UpdateUserStatusDTO = z.input<typeof UpdateUserStatusSchema>;
