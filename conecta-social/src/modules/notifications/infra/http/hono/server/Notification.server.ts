import { Hono } from "hono";

export const NotificationServer = () => {
  const app = new Hono();

  // Futuras rotas de Webhook (ex: SendGrid, AWS SES) entrariam aqui.
  // app.post('/webhooks/sendgrid', ...);

  return app;
}
