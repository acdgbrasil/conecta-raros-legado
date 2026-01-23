import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { NotificationChannel } from "../../domain/entity/Notification.entity";
import { Notification } from "../../domain/factories/Notification.factory";
import { NotificationRepository } from "../../domain/repository/Notification.repository";
import { NotificationDispatcher } from "../../infra/providers/NotificationDispatcher.service";
import { NotificationInput, SendNotificationEmailInput } from "../../mapper/Notification.input";
import { SendNotificationOutput } from "../../mapper/Notification.output";

/**
 * UseCase central de notificações.
 * Orquestra a criação, persistência e envio (via Dispatcher) de notificações.
 */
export class SendNotificationUseCase implements UseCaseProvider<SendNotificationEmailInput,SendNotificationOutput> {

  constructor(
    private readonly repository: NotificationRepository,
    private readonly dispatcher: NotificationDispatcher
  ) {}

  /**
   * Processa o envio.
   * 1. Cria entidade Notification.
   * 2. Persiste (estado PENDING).
   * 3. Despacha para o provider correto (Strategy).
   * 4. Atualiza estado (SENT/FAILED) e persiste novamente.
   */
  async execute(input: { recipient: string; channel: NotificationChannel; content: string; subject?: string | undefined; recipientId?: string | undefined; metadata?: Record<string, unknown> | undefined; }): Promise<SendNotificationOutput> {
    const parsedInput = NotificationInput.parser(input);

    const notification = Notification.create({
      recipient: parsedInput.recipient,
      channel: parsedInput.channel,
      subject: parsedInput.subject,
      content: parsedInput.content,
      recipientId: parsedInput.recipientId, 
      metadata: parsedInput.metadata
    });

    await this.repository.save(notification);

    try {
      const providerResponse = await this.dispatcher.dispatch(notification);
      notification.markAsSent(providerResponse);
      
    } catch (error: any) {
      console.error(`[SendNotification] Erro ao enviar para ${notification.recipient}:`, error);
      notification.markAsFailed(error);
    }

    await this.repository.save(notification);
    return {
      message: 'Notification processed',
      notificationId: notification.id!,
      status: notification.status,
    }
  }
}
