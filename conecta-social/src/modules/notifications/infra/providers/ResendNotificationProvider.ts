import { NotificationProvider } from "../../domain/protocols/NotificationProvider.protocol";
import { NotificationChannel } from "../../domain/entity/Notification.entity";
import { SendProviderInput } from "../../mapper/Notification.input";
import { SendProviderOutput } from "../../mapper/Notification.output";

/**
 * Provedor de envio de e-mails usando a API do Resend (Nativo Bun/Fetch).
 */
export class ResendNotificationProvider implements NotificationProvider {
  private readonly baseUrl = "https://api.resend.com/emails";

  constructor(
    private readonly apiKey: string,
    private readonly defaultFrom: string = "Conecta Raros <noreply@conectararos.com.br>" 
  ) {
    if (!apiKey) throw new Error("Resend API Key is required for ResendNotificationProvider");
  }

  supports(channel: NotificationChannel): boolean {
    return channel === "EMAIL";
  }

  async send(input: SendProviderInput): Promise<SendProviderOutput> {
    const payload = {
      from: this.defaultFrom,
      to: [input.recipient], // Resend espera array
      subject: input.subject || "Notificação Conecta Social",
      html: input.content, // Assumindo que nosso content é HTML/Text
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json() as any;

      if (!response.ok) {
        throw new Error(`Resend API Error: ${data.message || response.statusText}`);
      }

      return {
        providerMessageId: data.id,
        status: "sent",
        response: {
          raw: data
        }
      };

    } catch (error: any) {
      console.error("[ResendProvider] Error:", error);
      throw new Error(`Failed to send email via Resend: ${error.message}`);
    }
  }
}
