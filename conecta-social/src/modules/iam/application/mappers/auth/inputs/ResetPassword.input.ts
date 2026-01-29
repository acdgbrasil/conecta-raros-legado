import { z } from "zod";

export const ResetPasswordSchema = z.object({
  email: z.email(),
  code: z.string().length(6, { error: "Código deve ter exatamente 6 dígitos" }),
  newPassword: z.string().min(8)
});

export type ResetPasswordDTO = z.input<typeof ResetPasswordSchema>;
