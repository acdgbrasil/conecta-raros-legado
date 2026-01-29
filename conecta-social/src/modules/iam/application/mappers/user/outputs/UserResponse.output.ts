import { z } from "zod";

export const UserResponseSchema = z.object({
  id: z.uuidv7(),
  personId: z.uuidv7(),
  name: z.string(),
  email: z.email(),
  roleId: z.uuidv7(),
  isActive: z.boolean(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  lastLoginAt: z.string().optional(),
  createdAt: z.string(), // ISO String
  updatedAt: z.string()
});

export type UserResponseDTO = z.infer<typeof UserResponseSchema>;