import { z } from "zod";
import "hono-zod-openapi";
import { NotificationChannel } from "../domain/entity/Notification.entity";

// 1. Schema para Entrada do UseCase (API -> Domain)
export const SendNotificationEmailInputSchema = z.object({
  recipient: z.email({ error: "Destinatário deve ser um e-mail válido" })
    .meta({ description: "E-mail do destinatário", example: "test@example.com" }), 
  channel: z.enum(NotificationChannel, { error: "Canal de notificação inválido" })
    .meta({ description: "Canal de envio", example: "EMAIL" }),
  subject: z.string().optional()
    .meta({ description: "Assunto da mensagem", example: "Alerta de Sistema" }),
  content: z.string().min(1, { error: "Conteúdo da notificação é obrigatório" })
    .meta({ description: "Corpo da mensagem", example: "Seu código é 123456" }),
  recipientId: z.uuidv7({ error: "ID do destinatário inválido" }).optional()
    .meta({ description: "ID do usuário no sistema (UUID v7)", example: "018e9c32-1b0e-7447-8a62-7231d1b12345" }),
  metadata: z.record(z.string(), z.unknown()).optional()
    .meta({ description: "Metadados adicionais", example: { key: "value" } }),
});

export type SendNotificationEmailInput = z.infer<typeof SendNotificationEmailInputSchema>;

// 2. Schema para Entrada dos Providers (Domain -> Infra)
export const SendProviderInputSchema = z.object({
  recipient: z.string({ error: "Provider: Recipient required" }),
  subject: z.string().nullable().optional(),
  content: z.string({ error: "Provider: Content required" }),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type SendProviderInput = z.infer<typeof SendProviderInputSchema>;

// Helper de Parsing
export const NotificationInput = {
  send: SendNotificationEmailInputSchema,
  
  parser: (input: unknown): SendNotificationEmailInput => {
    return SendNotificationEmailInputSchema.parse(input);
  },

  providerParser: (input: unknown): SendProviderInput => {
    return SendProviderInputSchema.parse(input);
  }
};