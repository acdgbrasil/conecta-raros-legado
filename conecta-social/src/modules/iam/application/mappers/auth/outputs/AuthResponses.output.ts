import { z } from "zod";

export const RefreshTokenResponseSchema = z.object({
  accessToken: z.string().meta({ description: "Novo Access Token" }),
  refreshToken: z.string().meta({ description: "Novo Refresh Token (Rotação)" })
});

export const ForgotPasswordResponseSchema = z.object({
  message: z.string().meta({ 
    description: "Mensagem de instrução enviada",
    example: "Se o e-mail existir, um código foi enviado." 
  })
});

export const ResetPasswordResponseSchema = z.object({
  message: z.string().meta({ 
    description: "Confirmação de sucesso",
    example: "Senha redefinida com sucesso." 
  })
});

export type RefreshTokenResponseDTO = z.infer<typeof RefreshTokenResponseSchema>;
export type ForgotPasswordResponseDTO = z.infer<typeof ForgotPasswordResponseSchema>;
export type ResetPasswordResponseDTO = z.infer<typeof ResetPasswordResponseSchema>;
