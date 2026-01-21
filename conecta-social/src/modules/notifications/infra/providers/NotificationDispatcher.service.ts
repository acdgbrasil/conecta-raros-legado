import { NotificationChannel } from "../../domain/entity/Notification.entity";
import { Notification } from "../../domain/factories/Notification.factory";
import { NotificationProvider } from "../../domain/protocols/NotificationProvider.protocol";
import { SendProviderInput } from "../../mapper/Notification.input";
import { SendProviderOutput } from "../../mapper/Notification.output";

/**
 * Serviço responsável por selecionar e executar a estratégia de envio correta (Strategy Pattern).
 * Mantém uma lista de Providers e escolhe baseado no canal da notificação.
 */
export class NotificationDispatcher {
  private providers: NotificationProvider[] = [];

  constructor(providers: NotificationProvider[] = []) {
    this.providers = providers;
  }

  public register(provider: NotificationProvider): void {
    this.providers.push(provider);
  }

  /**
   * Encontra o provider adequado e despacha a notificação.
   */
  public async dispatch(notification: Notification): Promise<SendProviderOutput> {
    const provider = this.providers.find(p => p.supports(notification.channel));
    
    if (!provider) {
      throw new Error(`Nenhum provedor de notificação configurado para o canal: ${notification.channel}`);
    }

    // Mapeamento Entidade -> DTO do Provider
    const input: SendProviderInput = {
      recipient: notification.recipient,
      subject: notification.subject || null,
      content: notification.content,
      metadata: (notification as any).props.metadata // Acesso seguro se houver getter, ou via props se exposto
    };

    return await provider.send(input);
  }
}