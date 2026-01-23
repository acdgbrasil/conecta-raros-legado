import { PasswordRecoveryRequestedEvent } from "../../../iam/domain/user/events/PasswordRecoveryRequested.event";
import { EventHandler } from "../../../shared/domain/events/EventBus.protocol";
import { NotificationChannel } from "../../domain/entity/Notification.entity";
import { SendNotificationUseCase } from "../useCases/SendNotification.useCase";

/**
 * Handler responsável por escutar o evento `PasswordRecoveryRequested`
 * e disparar o e-mail com o código de recuperação.
 */
export class PasswordRecoveryHandler implements EventHandler<PasswordRecoveryRequestedEvent> {
  
  constructor(private readonly sendNotification: SendNotificationUseCase) {}

  async handle(event: PasswordRecoveryRequestedEvent): Promise<void> {
    console.log(`[EventBus] Processando recuperação de senha para: ${event.payload.email}`);
    
    await this.sendNotification.execute({
      recipient: event.payload.email,
      channel: NotificationChannel.EMAIL,
      subject: "Recuperação de Senha",
      content: `Seu código de recuperação é: ${event.payload.code}. Válido por 15 minutos.`
    });
  }
}