import { z } from "zod";

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, { error: "Refresh token é obrigatório" })
});

export type RefreshTokenDTO = z.input<typeof RefreshTokenSchema>;
