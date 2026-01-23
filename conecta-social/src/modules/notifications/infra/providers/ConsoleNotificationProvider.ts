import { NotificationChannel } from "../../domain/entity/Notification.entity";
import { NotificationProvider } from "../../domain/protocols/NotificationProvider.protocol";
import { SendProviderInput } from "../../mapper/Notification.input";
import { SendProviderOutput } from "../../mapper/Notification.output";

export class ConsoleNotificationProvider implements NotificationProvider {
  supports(channel: NotificationChannel): boolean {
    return true; 
  }

  async send(input: SendProviderInput): Promise<SendProviderOutput> {
    console.log(`[MOCK SEND] To: ${input.recipient}`);
    console.log(`Subject: ${input.subject}`);
    console.log(`Content: ${input.content}`);
    
    return Promise.resolve({ 
      providerMessageId: 'mock-id-' + Date.now(), 
      status: 'sent',
      response: { log: 'Printed to console' }
    });
  }
}
