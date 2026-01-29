import { createServer, defaultRouter } from "./modules/shared/http";
import { pg } from "./modules/shared/infra/postgres/client/postgres.client";
import { mapIamError } from "./modules/iam/infra/http/bun-server/utils/errorMapper";
import { BunEventBus } from "./modules/iam/infra/providers/bun/BunEventBus";

// --- MODULES ---
import { createIamModule } from "./modules/iam/IamModule";
import { createNotificationModule } from "./modules/notifications/NotificationModule";

// --- CONFIG ---
const PORT = Number(Bun.env.PORT) || 3000;

console.log("🚀 Starting Conecta Social (Native Bun)...");

// 1. Global Infra Warm-up (Health Check)
try {
  await pg`SELECT 1`;
  console.log("✅ Database Connection: OK");
} catch (err) {
  console.error("❌ Database Connection Failed. Shutting down.", err);
  process.exit(1);
}

// 2. Base Routes
defaultRouter.register("GET", "/health", (ctx) => ctx.json({ 
  status: "ok", 
  timestamp: new Date().toISOString(),
  uptime: process.uptime()
}));

// 3. Shared Infrastructure
const globalEventBus = new BunEventBus();

// 4. Load Modules
try {
  createIamModule(defaultRouter, globalEventBus);
  createNotificationModule(globalEventBus);
} catch (err) {
  console.error("❌ Erro ao carregar módulos:", err);
  process.exit(1);
}

// 5. Start Server
createServer({
  port: PORT,
  errorHandler: mapIamError // Por enquanto usamos o mapper do IAM como global, depois podemos compor mappers
});

console.log(`✅ Server listening on http://localhost:${PORT}`);
