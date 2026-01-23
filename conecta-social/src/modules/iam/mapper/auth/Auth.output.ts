import { z } from "zod";
import "hono-zod-openapi";

// Definição base do Usuário para resposta de Auth (Simplificado)
const AuthUserSchema = z.object({
  id: z.uuidv7()
    .meta({ description: "ID único do usuário logado", example: "018e9c32-1b0e-7447-8a62-7231d1b12345" }),
  name: z.string()
    .meta({ description: "Nome do usuário", example: "Pedro Alcantara" }),
  email: z.email()
    .meta({ description: "E-mail do usuário", example: "pedro@conecta.com" }),
  roleId: z.uuidv7()
    .meta({ description: "ID do cargo", example: "018e9c32-1b0e-7447-8a62-7231d1b12345" }),
  permissions: z.array(z.string())
    .meta({ description: "Slugs de permissão ativas para o usuário" }),
  isActive: z.boolean()
    .meta({ description: "Status de ativação" }),
  requiresReset: z.boolean()
    .meta({ description: "Flag de redefinição obrigatória" }),
});

// --- LOGIN OUTPUT ---
export const LoginOutputSchema = z.object({
  accessToken: z.string()
    .meta({ description: "JWT Access Token (curta duração)", example: "eyJhbGciOiJIUz..." }),
  refreshToken: z.string()
    .meta({ description: "JWT Refresh Token (longa duração)", example: "eyJhbGciOiJIUz..." }),
  user: AuthUserSchema
    .meta({ description: "Perfil resumido do usuário autenticado" })
});

export type LoginOutput = z.infer<typeof LoginOutputSchema>;

// --- REFRESH TOKEN OUTPUT ---
export const RefreshTokenOutputSchema = z.object({
  accessToken: z.string()
    .meta({ description: "Novo JWT Access Token", example: "eyJhbGciOiJIUz..." }),
  refreshToken: z.string()
    .meta({ description: "Novo JWT Refresh Token (Rotação de tokens)", example: "eyJhbGciOiJIUz..." }),
});

export type RefreshTokenOutput = z.infer<typeof RefreshTokenOutputSchema>;

// --- FORGOT PASSWORD OUTPUT ---
export const ForgotPasswordOutputSchema = z.object({
  message: z.string()
    .meta({ description: "Mensagem informativa sobre a solicitação", example: "Se o e-mail estiver cadastrado, você receberá um código." }),
});

export type ForgotPasswordOutput = z.infer<typeof ForgotPasswordOutputSchema>;

// --- RESET PASSWORD OUTPUT ---
export const ResetPasswordOutputSchema = z.object({
  message: z.string()
    .meta({ description: "Confirmação da alteração de senha", example: "Senha redefinida com sucesso." }),
});

export type ResetPasswordOutput = z.infer<typeof ResetPasswordOutputSchema>;