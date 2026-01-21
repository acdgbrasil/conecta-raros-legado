import { CreatedUserEvent } from "../../../../iam/domain/user/events/CreateNewUser.event";
import { EventHandler } from "../../../shared/domain/events/EventBus.protocol";
import { NotificationChannel } from "../../domain/entity/Notification.entity";
import { SendNotificationUseCase } from "../useCases/SendNotification.useCase";

/**
 * Handler responsável por escutar o evento `CreatedUserEvent`
 * e enviar o e-mail de boas-vindas com a senha temporária.
 */
export class UserCreatedHandler implements EventHandler<CreatedUserEvent> {
  
  constructor(private readonly sendNotification: SendNotificationUseCase) {}

  async handle(event: CreatedUserEvent): Promise<void> {
    const { email, name, plainPassword } = event.payload;

    console.log(`[EventBus] Enviando boas-vindas para: ${email}`);
    
    await this.sendNotification.execute({
      recipient: email,
      channel: NotificationChannel.EMAIL,
      subject: "Bem-vindo ao Sistema!",
      content: `Olá ${name}, sua conta foi criada com sucesso.\n\nSua senha temporária é: ${plainPassword}\n\nPor favor, faça login e altere sua senha imediatamente.`
    });
  }
}