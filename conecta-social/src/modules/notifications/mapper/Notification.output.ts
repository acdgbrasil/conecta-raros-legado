import { z } from "zod";
import { NotificationChannel, NotificationStatus } from "../domain/entity/Notification.entity";

// 1. Schema de Resposta da Entidade (Domain -> API)
export const NotificationResponseSchema = z.object({
  id: z.uuid(),
  recipient: z.string(),
  channel: z.enum(NotificationChannel),
  subject: z.string().optional(),
  content: z.string(),
  status: z.enum(NotificationStatus),
  sentAt: z.date().nullable().optional(),
  createdAt: z.date().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type NotificationResponse = z.infer<typeof NotificationResponseSchema>;

// 2. Schema de Saída do UseCase (UseCase -> Controller)
export const SendNotificationOutputSchema = z.object({
  message: z.string(),
  notificationId: z.uuid(),
  status: z.enum(NotificationStatus),
});

export type SendNotificationOutput = z.infer<typeof SendNotificationOutputSchema>;

// 3. Schema de Saída dos Providers (Infra -> Domain)
export const SendProviderOutputSchema = z.object({
  providerMessageId: z.string().optional(),
  status: z.enum(['sent', 'queued', 'failed']),
  response: z.any().optional(), // Payload cru do fornecedor (AWS, etc)
});

export type SendProviderOutput = z.infer<typeof SendProviderOutputSchema>;
