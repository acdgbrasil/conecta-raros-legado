import { z } from "zod";

// Definição base do Usuário para resposta de Auth (Simplificado)
const AuthUserSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  roleId: z.uuid(),
  permissions: z.array(z.string()),
  isActive: z.boolean(),
  requiresReset: z.boolean(),
});

// --- LOGIN OUTPUT ---
export const LoginOutputSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: AuthUserSchema
});

export type LoginOutput = z.infer<typeof LoginOutputSchema>;

// --- REFRESH TOKEN OUTPUT ---
export const RefreshTokenOutputSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type RefreshTokenOutput = z.infer<typeof RefreshTokenOutputSchema>;

// --- FORGOT PASSWORD OUTPUT ---
export const ForgotPasswordOutputSchema = z.object({
  message: z.string(),
});

export type ForgotPasswordOutput = z.infer<typeof ForgotPasswordOutputSchema>;

// --- RESET PASSWORD OUTPUT ---
export const ResetPasswordOutputSchema = z.object({
  message: z.string(),
});

export type ResetPasswordOutput = z.infer<typeof ResetPasswordOutputSchema>;