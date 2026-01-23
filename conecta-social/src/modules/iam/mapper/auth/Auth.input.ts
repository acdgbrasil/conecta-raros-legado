import { z } from "zod";
import "hono-zod-openapi";
import { PasswordStrongSchema } from "../../../shared/types/zod/password.zod";

// --- LOGIN ---
export const LoginInputSchema = z.object({
  email: z.email({ error: "Formato de e-mail inválido" })
    .meta({
      description: "E-mail do usuário para login",
      example: "usuario@empresa.com"
    }),
  password: PasswordStrongSchema
    .meta({
      description: "Senha do usuário",
      example: "S3nhaForte!123"
    }),
});

export type LoginInput = z.infer<typeof LoginInputSchema>;

// --- REFRESH TOKEN ---
export const RefreshTokenInputSchema = z.object({
  refreshToken: z.string().min(1, { error: "Refresh token é obrigatório" })
    .meta({
      description: "Token de atualização (Refresh Token) válido",
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }),
});

export type RefreshTokenInput = z.infer<typeof RefreshTokenInputSchema>;

// --- FORGOT PASSWORD (Preparando terreno) ---
export const ForgotPasswordInputSchema = z.object({
  email: z.email({ error: "Formato de e-mail inválido" })
    .meta({
      description: "E-mail cadastrado para envio de recuperação de senha",
      example: "usuario@empresa.com"
    }),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInputSchema>;

// --- RESET PASSWORD ---
export const ResetPasswordInputSchema = z.object({
  email: z.email({ error: "Formato de e-mail inválido" })
    .meta({
      description: "E-mail do usuário que solicitou a troca",
      example: "usuario@empresa.com"
    }),
  code: z.string().length(6, { error: "O código deve ter exatamente 6 dígitos" })
    .meta({
      description: "Código de verificação de 6 dígitos enviado por e-mail",
      example: "123456"
    }),
  newPassword: PasswordStrongSchema
    .meta({
      description: "Nova senha desejada (deve seguir regras de complexidade)",
      example: "Nov@S3nha123!"
    }),
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