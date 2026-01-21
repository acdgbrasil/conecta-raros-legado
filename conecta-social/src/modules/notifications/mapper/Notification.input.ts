import { z } from "zod";
import { NotificationChannel } from "../domain/entity/Notification.entity";

// 1. Schema para Entrada do UseCase (API -> Domain)
export const SendNotificationEmailInputSchema = z.object({
  recipient: z.email({ error: "Destinatário deve ser um e-mail válido" }), 
  channel: z.enum(NotificationChannel, { error: "Canal de notificação inválido" }),
  subject: z.string().optional(),
  content: z.string().min(1, { error: "Conteúdo da notificação é obrigatório" }),
  recipientId: z.uuid({ error: "ID do destinatário inválido" }).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
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