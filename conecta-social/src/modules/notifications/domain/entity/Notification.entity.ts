import { z } from "zod";
import "hono-zod-openapi";

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
  id: z.uuidv7().optional()
    .meta({ 
      description: "Identificador único da notificação (UUID v7)",
      example: "018e9c32-1b0e-7447-8a62-7231d1b12345" 
    }),
  recipient: z.string().min(1, { error: "Destinatário é obrigatório" })
    .meta({ 
      description: "Endereço ou número do destinatário (Email, Telefone, Token)",
      example: "usuario@exemplo.com" 
    }),
  channel: z.enum(NotificationChannel)
    .meta({ 
      description: "Canal de envio utilizado",
      example: "EMAIL" 
    }),
  subject: z.string().optional()
    .meta({ 
      description: "Assunto da notificação (relevante para e-mails)",
      example: "Bem-vindo ao Conecta Social" 
    }),
  content: z.string().min(1, { error: "Conteúdo da notificação é obrigatório" })
    .meta({ 
      description: "Conteúdo principal da mensagem",
      example: "Seu código de acesso é 123456" 
    }),
  recipientId: z.uuidv7().optional().nullable()
    .meta({ 
      description: "ID do usuário vinculado no sistema (UUID v7)",
      example: "018e9c32-1b0e-7447-8a62-7231d1b12345" 
    }),
  metadata: z.record(z.string(), z.unknown()).optional()
    .meta({ 
      description: "Dados técnicos adicionais do provedor",
      example: { provider: "resend", messageId: "msg_123" } 
    }),
  status: z.enum(NotificationStatus).default(NotificationStatus.PENDING)
    .meta({ 
      description: "Estado atual do ciclo de vida da notificação" 
    }),
  sentAt: z.date().optional().nullable()
    .meta({ 
      description: "Data e hora em que o provedor confirmou o envio" 
    }),
  createdAt: z.date().optional()
    .meta({ 
      description: "Data de criação do registro de notificação" 
    }),
  updatedAt: z.date().optional()
    .meta({ 
      description: "Data da última modificação do registro" 
    }),
});


export type NotificationEntity = z.infer<typeof NotificationSchema>;