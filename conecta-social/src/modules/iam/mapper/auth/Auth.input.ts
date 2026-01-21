import z from "zod";
import { PasswordStrongSchema } from "../../../shared/types/zod/password.zod";

// --- LOGIN ---
export const LoginInputSchema = z.object({
  email: z.email({ error: "Formato de e-mail inválido" }),
  password: PasswordStrongSchema,
});

export type LoginInput = z.infer<typeof LoginInputSchema>;

// --- REFRESH TOKEN ---
export const RefreshTokenInputSchema = z.object({
  refreshToken: z.string().min(1, { error: "Refresh token é obrigatório" }),
});

export type RefreshTokenInput = z.infer<typeof RefreshTokenInputSchema>;

// --- FORGOT PASSWORD (Preparando terreno) ---
export const ForgotPasswordInputSchema = z.object({
  email: z.email({ error: "Formato de e-mail inválido" }),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInputSchema>;

// --- RESET PASSWORD ---
export const ResetPasswordInputSchema = z.object({
  email: z.email({ error: "Formato de e-mail inválido" }),
  code: z.string().length(6, { error: "O código deve ter exatamente 6 dígitos" }),
  newPassword: PasswordStrongSchema,
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordInputSchema>;

// --- EXPORT UNIFICADO ---
export const AuthInput = {
  login: LoginInputSchema,
  refresh: RefreshTokenInputSchema,
  forgotPassword: ForgotPasswordInputSchema,
  resetPassword: ResetPasswordInputSchema,
  
  parserLogin: (input: unknown) => LoginInputSchema.parse(input),
  parserRefresh: (input: unknown) => RefreshTokenInputSchema.parse(input),
  parserForgotPassword: (input: unknown) => ForgotPasswordInputSchema.parse(input),
  parserResetPassword: (input: unknown) => ResetPasswordInputSchema.parse(input),
};
