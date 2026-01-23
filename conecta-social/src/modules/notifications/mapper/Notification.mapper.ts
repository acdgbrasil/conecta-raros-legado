import { NotificationEntity } from "../domain/entity/Notification.entity";
import { Notification } from "../domain/factories/Notification.factory";
import { NotificationResponse } from "./Notification.output";

export const NotificationMapper = {
  /**
   * Converte dados crus do Banco de Dados (snake_case) para a Entidade de Domínio.
   */
  toDomain(raw: any): Notification {
    const props: NotificationEntity = {
      id: raw.id,
      recipient: raw.recipient,
      channel: raw.channel,
      subject: raw.subject,
      content: raw.content,
      recipientId: raw.recipient_id,
      metadata: raw.metadata || {},
      status: raw.status,
      sentAt: raw.sent_at ? new Date(raw.sent_at) : null,
      createdAt: raw.created_at ? new Date(raw.created_at) : undefined,
      updatedAt: raw.updated_at ? new Date(raw.updated_at) : undefined,
    };
    return Notification.restore(props);
  },

  /**
   * Converte a Entidade de Domínio para o formato do Banco de Dados (Postgres/SQL).
   * Note que usamos os getters da classe Notification.
   */
  toPersistence(notification: Notification): any {
    return {
      id: notification.id,
      recipient: notification.recipient,
      channel: notification.channel,
      subject: notification.subject || null,
      content: notification.content,
      recipient_id: (notification as any).props.recipientId || null, // Acesso direto via props se não houver getter público
      metadata: (notification as any).props.metadata || {},
      status: notification.status,
      sent_at: (notification as any).props.sentAt ? (notification as any).props.sentAt.toISOString() : null,
      created_at: (notification as any).props.createdAt ? (notification as any).props.createdAt.toISOString() : null,
      updated_at: (notification as any).props.updatedAt ? (notification as any).props.updatedAt.toISOString() : null,
    };
  },

  /**
   * Converte a Entidade de Domínio para o objeto de resposta da API (DTO).
   */
  toResponse(notification: Notification): NotificationResponse {
    return {
      id: notification.id!,
      recipient: notification.recipient,
      channel: notification.channel,
      subject: notification.subject,
      content: notification.content,
      status: notification.status,
      sentAt: (notification as any).props.sentAt,
      createdAt: (notification as any).props.createdAt,
      metadata: (notification as any).props.metadata,
    };
  }
}