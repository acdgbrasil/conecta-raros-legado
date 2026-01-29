import { EventBus } from "../shared/domain/events/EventBus.protocol";
import { getSecret } from "../shared/infra/config/secrets";

// --- INFRA ---
import { NotificationPostgresRepository } from "./infra/database/postgres/services/NotificationPostgres.service";
import { NotificationDispatcher } from "./infra/providers/NotificationDispatcher.service";
import { ResendNotificationProvider } from "./infra/providers/ResendNotificationProvider.ts";

// --- USE CASES ---
import { SendNotificationUseCase } from "./application/useCases/SendNotification.useCase";

// --- HANDLERS ---
import { UserCreatedHandler } from "./application/handlers/UserCreated.handler";
import { PasswordRecoveryHandler } from "./application/handlers/PasswordRecovery.handler";

export function createNotificationModule(eventBus: EventBus) {
  console.log("🔔 Inicializando Módulo Notifications...");

  // 1. Config
  const resendApiKey = getSecret("RESEND_API_KEY");
  
  // 2. Infra
  const repository = new NotificationPostgresRepository();
  const dispatcher = new NotificationDispatcher();

  // Registrar Providers
  if (resendApiKey) {
    dispatcher.register(new ResendNotificationProvider(resendApiKey));
    console.log("   --> Resend Provider: Registered");
  } else {
    console.warn("   ⚠️  RESEND_API_KEY not found. Emails will fail.");
  }

  // 3. UseCases
  const sendNotification = new SendNotificationUseCase(repository, dispatcher);

  // 4. Event Handlers (Subscribers)
  // Conecta os eventos do domínio (IAM) aos Casos de Uso de Notificação
  const userCreatedHandler = new UserCreatedHandler(sendNotification);
  const recoveryHandler = new PasswordRecoveryHandler(sendNotification);

  // Registra no Barramento Global
  eventBus.subscribe("UserCreated", userCreatedHandler);
  eventBus.subscribe("PasswordRecoveryRequested", recoveryHandler);

  console.log("🔔 Módulo Notifications carregado (Ouvindo eventos).");
}
