import { z } from "zod";

const AuthUserSummarySchema = z.object({
  id: z.uuidv7(),
  name: z.string(),
  email: z.email(),
  roleId: z.uuidv7(),
  isActive: z.boolean()
});

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: AuthUserSummarySchema
});

export type LoginResponseDTO = z.infer<typeof LoginResponseSchema>;
