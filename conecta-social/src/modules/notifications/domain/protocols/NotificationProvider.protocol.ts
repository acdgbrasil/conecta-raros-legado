import { NotificationChannel } from "../entity/Notification.entity";
import { SendProviderInput } from "../../mapper/Notification.input";
import { SendProviderOutput } from "../../mapper/Notification.output";

export interface NotificationProvider {
  /**
   * Verifica se este provider suporta o canal solicitado.
   */
  supports(channel: NotificationChannel): boolean;

  /**
   * Envia a notificação e retorna os metadados do envio.
   */
  send(input: SendProviderInput): Promise<SendProviderOutput>;
}
