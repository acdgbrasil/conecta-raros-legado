# Relatório de Refatoração e Consolidação: Conecta Social API

**Data:** 20 de Janeiro de 2026
**Status:** ✅ Concluído (Fase Alpha)

Este relatório consolida a grande refatoração realizada para transformar a API legada em um **Monólito Modular** moderno, seguro e escalável, utilizando **Bun**, **Hono**, **PostgreSQL** e **Clean Architecture**.

---

## 1. Mudança Arquitetural (Big Bang)

Migramos de uma estrutura legada e acoplada (Express + Mongo/Postgres misturados) para uma arquitetura modular estrita.

### Antes vs. Depois
*   **Runtime:** Node.js -> **Bun 1.1+** (Performance nativa, Testes e SQL embutidos).
*   **Framework:** Express -> **Hono** (Leve, compatível com edge, tipagem forte).
*   **Validação:** Validações manuais -> **Zod v4** (Inputs e Outputs tipados).
*   **Database:** Drivers genéricos -> **Bun SQL** (`bun:sql`) com queries parametrizadas.
*   **Comunicação:** Chamadas diretas -> **EventBus** (Desacoplamento entre módulos).

## 2. Módulos Implementados

### 🔐 IAM (Identity & Access Management)
Módulo responsável por toda a segurança e gestão de usuários.
*   **Funcionalidades:**
    *   Login & Refresh Token com detecção de reuso.
    *   RBAC (Role-Based Access Control) granular com permissões (ex: `users:write`).
    *   Gestão de Usuários: Criar, Listar (paginado), Editar, Ativar/Desativar.
    *   Troca de Cargo com revogação instantânea de sessões.
    *   Recuperação de Senha segura (OTP 6 dígitos + Silent Fail).
*   **Segurança:** Senhas com hash Argon2/Bcrypt (via Bun), proteção contra SQL Injection e Enumeration Attacks.

### 🔔 Notifications
Orquestrador de envio de mensagens multicanal.
*   **Arquitetura:** Strategy Pattern (`NotificationDispatcher`) para selecionar o provedor (Email, SMS, etc).
*   **Implementação:**
    *   `ConsoleNotificationProvider` (Mock para dev).
    *   Integração via EventBus (`UserCreated` -> Envia boas-vindas).

### 🤝 Shared Kernel
Componentes reutilizáveis por todos os módulos.
*   **EventBus:** Implementação `InMemory` (preparada para migração futura para Redis/RabbitMQ).
*   **Infra:** Cliente Postgres Singleton seguro.

---

## 3. Qualidade e Padronização

*   **Mappers:** Todos os dados que entram (`.input.ts`) e saem (`.output.ts`) da aplicação passam por Mappers com schemas Zod v4 rigorosos.
*   **Pure DI:** Injeção de Dependência manual (`Iam.server.ts`), garantindo inicialização rápida e sem "mágica" de frameworks.
*   **Docker:** Imagem otimizada (`alpine`) com `.dockerignore` configurado para excluir o módulo legado `social` da produção.

## 4. O que foi arquivado/removido
*   Implementações antigas de conexão com banco (`src/modules/database`).
*   Scripts de migração legados que não seguiam o padrão Bun SQL.
*   Documentação dispersa na raiz do projeto (agora centralizada no `handbook/`).

## 5. Próximos Passos (Tech Debt)
*   **Testes:** Iniciar bateria de testes automatizados (Unitários e E2E) para os módulos Alpha.
*   **EventBus:** Migrar para solução persistente (Redis) antes do Go-Live em escala.
*   **Auditoria:** Implementar tabela de logs para rastrear alterações de dados sensíveis.
