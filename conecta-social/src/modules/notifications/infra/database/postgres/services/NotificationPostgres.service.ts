import { pg } from "../../../../../shared/infra/postgres/client/postgres.client";
import { Notification } from "../../../../domain/factories/Notification.factory";
import { NotificationRepository } from "../../../../domain/repository/Notification.repository";
import { NotificationMapper } from "../../../../mapper/Notification.mapper";

export class NotificationPostgresRepository implements NotificationRepository {
  async save(notification: Notification): Promise<void> {
    const n = NotificationMapper.toPersistence(notification);
    await pg`
      INSERT INTO notifications (
        id, recipient, channel, subject, content, 
        recipient_id, metadata, status, sent_at, 
        created_at, updated_at
      ) VALUES (
        COALESCE(${n.id || null}, uuidv7()), ${n.recipient}, ${n.channel}, ${n.subject}, ${n.content},
        ${n.recipient_id}, ${n.metadata}, ${n.status}, ${n.sent_at},
        ${n.created_at}, ${n.updated_at}
      )
      ON CONFLICT (id) DO UPDATE SET
        recipient = EXCLUDED.recipient,
        channel = EXCLUDED.channel,
        status = EXCLUDED.status,
        sent_at = EXCLUDED.sent_at,
        metadata = EXCLUDED.metadata,
        updated_at = EXCLUDED.updated_at;
    `;
  }

  async findById(id: string): Promise<Notification | null> {
    const [row] = await pg`
      SELECT * FROM notifications WHERE id = ${id} LIMIT 1
    `;
    if (!row) return null;
    return NotificationMapper.toDomain(row);
  }

}
