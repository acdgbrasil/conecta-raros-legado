import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { IamServer } from "./modules/iam/infra/http/hono/server/Iam.server";
import { NotificationServer } from "./modules/notifications/infra/http/hono/server/Notification.server";

// Inicializa a aplicação principal (Gateway)
const app = new Hono();

// Middlewares Globais
app.use('*', logger());
app.use('*', cors());

// Health Check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date() }));

console.log("🚀 Inicializando Módulos...");

// --- MÓDULO IAM ---
// Monta o servidor IAM na rota base /iam (ex: /iam/auth/login)
// Mas como suas rotas no controller já são /auth/login, talvez você queira na raiz ou /api/iam
// Vou montar em /api para ficar organizado: /api/auth/login, /api/users
const iamApp = IamServer();
app.route('/api', iamApp);
console.log("✅ Módulo IAM carregado.");

// --- MÓDULO NOTIFICATIONS ---
// Monta o servidor de notificações (Webhooks, etc)
const notificationApp = NotificationServer();
app.route('/api/notifications', notificationApp);
console.log("✅ Módulo Notifications carregado.");

// --- MÓDULO SOCIAL (Legado/Desligado) ---
// const socialApp = SocialServer();
// app.route('/api/social', socialApp);
console.log("⚠️  Módulo Social está desligado.");

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};

console.log(`\n🌐 Server is running on port ${process.env.PORT || 3000}`);
