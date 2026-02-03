import { IamModule } from "./modules/iam/iam.module";

// Função principal de bootstrap
async function bootstrap() {
  console.log("🚀 Iniciando sistema Envolve...");

  try {
    // 1. Inicializar Módulos (Conexão DB, DI, etc)
    console.log("📦 Carregando módulos...");
    
    // O módulo IAM conecta no banco e prepara os UseCases
    await IamModule.initialize();
    
    // 2. Unificar Rotas
    // O objeto appRoutes deve ser PLANO (Flat). 
    // IamModule.routes já vem prefixado (ex: "/iam/mobile/login") graças ao prefixRoutes
    const appRoutes = {
      // Rota de Health Check global
      "/health": new Response("OK"),

      // Espalha as rotas do IAM na raiz
      ...IamModule.routes,
    };

    // 3. Subir o Servidor Bun Nativo
    const server = Bun.serve({
      port: process.env.PORT || 3000,
      development: process.env.NODE_ENV !== "production",
      
      // A mágica acontece aqui: Roteamento C++ Nativo
      routes: appRoutes,

      // Fallback para 404 (quando nenhuma rota bate)
      fetch(req) {
        return new Response(JSON.stringify({ 
          error: "Not Found", 
          path: new URL(req.url).pathname 
        }), { 
          status: 404, 
          headers: { "Content-Type": "application/json" }
        });
      },

      // Tratamento Global de Erros (Crash safety)
      error(error) {
        console.error("🔥 Server Error:", error);
        return new Response(JSON.stringify({ 
          type: "about:blank",
          title: "Internal Server Error",
          status: 500,
          detail: error.message 
        }), {
          status: 500,
          headers: { "Content-Type": "application/problem+json" }
        });
      }
    });

    console.log(`✅ Servidor rodando em: ${server.url}`);
    console.log(`🔍 Rotas carregadas:`, Object.keys(appRoutes));

  } catch (error) {
    console.error("❌ Falha fatal ao iniciar:", error);
    process.exit(1);
  }
}

// Executa
await bootstrap();
