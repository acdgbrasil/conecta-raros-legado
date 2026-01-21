import { z } from "zod";

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  PUSH = 'PUSH'
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED'
}

export const NotificationSchema = z.object({
  id: z.uuid().optional(),
  recipient: z.string().check(z.minLength(1, "Destinatário é obrigatório")),
  channel: z.enum(NotificationChannel),
  subject: z.string().optional(),
  content: z.string().check(z.minLength(1, "Conteúdo da notificação é obrigatório")),
  recipientId: z.uuid().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(NotificationStatus).default(NotificationStatus.PENDING),
  sentAt: z.date().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});


export type NotificationEntity = z.infer<typeof NotificationSchema>;