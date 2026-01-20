import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';

// Infrastructure (Mantendo a conexão original do Mongo/Postgres)
import { connectionMongose, testConnection } from './infra/database/mongodb/mongoDtos/mongodbDto.js';
import { MongooseClientSingleton } from './infra/database/mongodb/mongooseClientSingleton.js';

// Módulos (Novo IAM)

// Rotas Legadas
import referencePersonRouter from './presenter/routers/modules/referencePersonRouter.js';
import familyRouter from './presenter/routers/modules/familyRouter.js';
import conditionsRouter from './presenter/routers/modules/conditionsRouter.js';
import socialRiskRouter from './presenter/routers/modules/socialRiskRouter.js';
import userManagementRouter from './presenter/routers/modules/userManagementRouter.js';
import { seedIAM } from './modules/shared/infra/postgres/migrations/seed.js';
import { IamServer } from './modules/shared/http/hono/server/Iam.server.js';

const app = new Hono();

// Middleware Global
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors());

// Health Check
app.get('/health', (c) => c.json({ status: 'ok', uptime: process.uptime() }));

// --- Inicialização do Banco de Dados ---
const startDatabase = async () => {
    try {

        //Bootstrap dos bancos de dados
        seedIAM().then(() => console.log('✅ IAM Seeded Successfully')).catch((err) => {
            console.error('❌ IAM Seeding Failed:', err);
        });
        // Mongo (Negócio)
        const mongoClient = await connectionMongose();
        MongooseClientSingleton.setInstance(mongoClient);
        testConnection();
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ Database Connection Failed:', error);
        // Não encerramos o processo para permitir depuração via Hono se necessário
    }
};

// --- Rotas ---

// 1. Novo Módulo IAM (Autenticação Enterprise)
app.route('/api/v1', IamServer());

// 2. Rotas de Negócio Legadas (Legacy Bridge)
const legacyApp = new Hono();
legacyApp.route('/reference-person', referencePersonRouter);
legacyApp.route('/family', familyRouter);
legacyApp.route('/conditions', conditionsRouter);
legacyApp.route('/social-risk', socialRiskRouter);
legacyApp.route('/user-management', userManagementRouter);

app.route('/api/legacy', legacyApp);

// Inicialização via Bun.serve implícito pelo Hono
const port = parseInt(process.env.PORT || '3000');
console.log(`🚀 Server running on port ${port}`);

startDatabase();

export default {
    port,
    fetch: app.fetch,
};