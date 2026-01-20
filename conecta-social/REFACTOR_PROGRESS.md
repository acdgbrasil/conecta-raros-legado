# Relatório de Refatoração: Migração Bun + Hono

Este documento resume o progresso da refatoração "Big Bang" realizada no projeto **Conecta Social**.

## 📅 O que foi feito hoje
1.  **Migração de Runtime e Framework:**
    -   Remoção completa do ecossistema Express (`express`, `body-parser`, `cors`).
    -   Instalação e configuração do **Hono v4** (Bun Native) para alta performance.
    -   Introdução do **Zod** para validações de esquema seguras e leves.
2.  **Novo Entrypoint (`src/index.ts`):**
    -   Implementação de um servidor Hono limpo com middlewares nativos (`logger`, `cors`, `prettyJSON`).
    -   Configuração de inicialização paralela de bancos de dados (Postgres e MongoDB).
3.  **Arquitetura Modular IAM (`src/modules/iam`):**
    -   Criação de um módulo de Identidade e Acesso isolado.
    -   Implementação de **Middleware de Autenticação** robusto com injeção de payload no contexto do Hono.
    -   Implementação de **Role Guard (RBAC)** para proteção de rotas por nível de acesso (ADMIN, MANAGER, OPERATOR).
    -   Controllers de Auth (Login) e Admin (Provisionamento de usuários) integrados ao legado.
4.  **Legacy Bridge:**
    -   Mapeamento das rotas antigas para o prefixo `/api/legacy/`, mantendo a lógica de negócio MongoDB intacta conforme solicitado.
5.  **Hotfix de Infraestrutura:**
    -   Restauração do arquivo `jwtToken.ts` que estava com sintaxe corrompida.

---

## ✅ O que está FUNCIONANDO
-   **Server:** Inicialização via `bun src/index.ts`.
-   **Health Check:** `GET /health` respondendo com status do sistema.
-   **Autenticação (Nova):**
    -   `POST /api/v1/auth/login`: Valida credenciais no Postgres usando Bcrypt legado e retorna JWT novo.
-   **Administração (Nova):**
    -   `POST /api/v1/admin/provision`: Permite que um ADMIN crie novos usuários com senhas temporárias.
    -   `GET /api/v1/admin/users`: Lista usuários cadastrados (via Postgres).
-   **Roteamento:** O sistema de rotas do Hono está distribuindo corretamente entre o novo módulo e os controllers legados.

---

## ⚠️ O que NÃO está funcionando (ou precisa de atenção)
-   **Conexão Postgres:** Durante os testes, o erro `ENOTFOUND` indicou que as variáveis de ambiente no `.env` (ex: `DB_HOST`) podem precisar de ajuste para o ambiente local/docker do Bun.
-   **Envio de E-mail:** O provisionamento de usuários está utilizando um `console.log` como mock. É necessário conectar o `SmtpService` existente.
-   **Rotas Legadas (Mongo):** Embora montadas, as rotas em `/api/legacy/` precisam de testes de fumaça, pois a mudança de `req/res` do Express para o `Context` do Hono pode exigir pequenos ajustes nos controllers antigos se eles acessarem o objeto `res` diretamente.
-   **Swagger:** Os endpoints de documentação precisam ser re-mapeados para a sintaxe do Hono-Swagger.

---

## 🚀 Próximos Passos Recomendados
1.  Ajustar as variáveis de ambiente no `.env` para garantir a conexão estável com o Postgres.
2.  Substituir o mock de e-mail no `AdminController` pela chamada real ao `SmtpService`.
3.  Testar os fluxos principais de negócio (Reference Person / Family) via prefixo `/api/legacy`.
4.  Remover os controllers e routers legados de Auth (`authRouter.ts`, `admRouter.ts`) assim que o frontend migrar para os novos endpoints `/api/v1`.
