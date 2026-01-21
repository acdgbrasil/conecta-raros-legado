import { Notification } from "../factories/Notification.factory";

export interface NotificationRepository {
  save(notification: Notification): Promise<void>;
  findById(id: string): Promise<Notification | null>;
}