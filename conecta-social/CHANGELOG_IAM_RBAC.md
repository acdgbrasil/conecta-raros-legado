# Changelog: Implementação do Módulo IAM (RBAC)

Este documento detalha as alterações realizadas para implementar o novo sistema de **Controle de Acesso Baseado em Funções (RBAC)** utilizando **Bun.sql**, **Hono** e **PostgreSQL**.

## 1. Módulo IAM (`src/modules/iam`)

Foi criada uma nova estrutura modular seguindo os princípios de Clean Architecture.

### Domínio (`src/modules/iam/domain`)
- **`User.ts`**: Entidade de Domínio rica.
  - Implementa o método `can(permissionSlug)` para verificação granular de permissões (suporta wildcards como `users:*`).
  - Implementa `requiresReset()` para fluxo de troca de senha forçada.
  - Tipagem flexível (`string | number`) para IDs para compatibilidade com legado.

### Infraestrutura (`src/modules/iam/infra`)
- **`IAMRepository.ts`**: Repositório nativo usando `Bun.sql`.
  - Método `findByEmail`: Realiza uma query otimizada (JOIN) para trazer o usuário e todas as suas permissões (`role_permissions`) em uma única consulta.
  - Métodos auxiliares para criação de Roles e Permissões.
- **`seed.ts`**: Script de inicialização (Seed).
  - Garante a existência das permissões básicas (`users:read`, `users:write`, `families:*`, etc.).
  - Cria os perfis padrão: `ADMIN` (todas as permissões) e `OPERATOR` (permissões limitadas).

### HTTP & Middlewares (`src/modules/iam/http`)
- **`auth.middleware.ts`**:
  - `authMiddleware`: Valida o JWT, busca o usuário atualizado no banco (para garantir permissões frescas) e injeta no contexto.
  - `requirePermission(slug)`: Factory de middleware para proteger rotas específicas baseadas nas permissões do usuário (ex: `requirePermission('users:write')`).

### Entrypoint (`src/modules/iam/iam.module.ts`)
- Configuração do roteador `Hono` para o módulo.
- Definição de rotas (Stubs) para Login e Provisionamento.
- Exemplo de rota protegida para validação.

---

## 2. Banco de Dados e Migrations

### Migrations (`src/infra/database/postgress/migrations`)
- **`iam_rbac_migration.ts`**: Nova migration criada para estruturar o banco para RBAC.
  - **Tabelas Criadas**: `permissions`, `role_permissions`.
  - **Alterações em `roles`**: Adição de coluna `slug` (ex: 'ADMIN').
  - **Alterações em `users`**: Adição de `role_id` (FK) e `force_change_password`.
  - **Migração de Dados**: Script inteligente para converter as roles antigas (strings na tabela de usuários) para os novos IDs relacionais.

---

## 3. Configuração e Infraestrutura

### Aplicação (`src/index.ts`)
- Atualizado o fluxo de inicialização `startDatabase`.
- Agora executa sequencialmente:
  1. Migrations Legadas.
  2. **Migration RBAC** (`iam_rbac_migration`).
  3. **Seed IAM** (`seedIAM`), garantindo que o banco sempre tenha as permissões mínimas necessárias ao iniciar.

### Docker (`Dockerfile`)
- Refatorado para **Multi-stage Build**.
  - **Stage `deps`**: Instala dependências (incluindo dev).
  - **Stage `runner`**: Imagem final leve (Alpine), copiando apenas arquivos necessários e `node_modules` de produção.

### Ambiente (`example.env`)
- Adicionadas variáveis de configuração para o **Bun.sql**:
  - `POSTGRES_SSL`: Para conexões seguras em produção.
  - `POSTGRES_URL`: Opção para connection string completa.

---

## Como Validar

1. **Subir o Banco**: Certifique-se que o Postgres está rodando.
2. **Iniciar a Aplicação**: `bun start` (ou via Docker).
3. **Logs Esperados**:
   ```
   ✅ Postgres Connected (Bun.sql)
   --- [MIGRATION] Starting IAM RBAC Setup ---
   ...
   --- [MIGRATION] IAM RBAC Setup Completed ---
   Starting IAM Seed...
   ...
   IAM Seed completed.
   🚀 Server running on port 3000
   ```
