Analisei a estrutura do seu projeto (`src` folder).

Você já tem o início da estrutura modular em `src/modules/iam`, mas ela parece estar com a versão antiga (Role Enum simples) e o `postgres.ts` precisa ser a fonte da conexão `Bun.sql`.

O prompt abaixo foi desenhado para **sobrescrever/atualizar** essa estrutura para o modelo **RBAC Baseado em Banco de Dados (Opção B)** que definimos, conectando corretamente com sua infraestrutura existente.

Copie e cole isso na sua IA/CLI:

---

### Prompt: Boilerplate IAM Enterprise (Bun.sql + Hono)

```markdown
@uploaded:src/infra/database/postgress/postgres.ts
@uploaded:src/modules/iam/iam.module.ts

Atue como um Arquiteto de Software Sênior especialista em Bun.
Estamos evoluindo o módulo de IAM (localizado em `src/modules/iam`) para um sistema de **RBAC Granular (Permission-Based)**.

**Objetivo:** Gerar o código TypeScript para a camada de Domínio, Infraestrutura (Repositório) e HTTP deste módulo, usando **Bun.sql nativo** e **Hono**.

**Contexto da Infraestrutura:**
- A conexão do banco está em `src/infra/database/postgress/postgres.ts`. Importe a instância `sql` de lá.
- O Schema do banco (que será aplicado via migration separada) é este:
  ```sql
  -- permissions, roles, role_permissions, users (com auditoria e force_change_password)

```

---

**Gere os seguintes arquivos com o código completo:**

### 1. Entidade de Domínio Rica (`src/modules/iam/domain/User.ts`)

* Defina a classe `User` e a interface `UserProps`.
* Propriedades obrigatórias: `id`, `name`, `email`, `roleId`, `permissions` (array de strings, ex: `['user:create']`), `forceChangePassword`, `isActive`.
* Implemente o método `can(permissionSlug: string): boolean`.
* Implemente o método `requiresReset(): boolean`.
* **Regra:** O array de `permissions` deve ser populado no momento da leitura do banco (hidratação).

### 2. Repositório com Bun.sql (`src/modules/iam/infra/IAMRepository.ts`)

* Importe `{ sql }` de `../../infra/database/postgress/postgres`.
* Implemente `findByEmail(email: string): Promise<User | null>`.
* **QUERY CRÍTICA:** Deve fazer um `SELECT` no usuário e um `JOIN` ou subquery para buscar **todas** as permissões da Role dele na tabela `role_permissions` -> `permissions`.
* Retorne a instância da entidade `User` já com o array de permissões preenchido.


* Implemente `save(user: User): Promise<void>`.
* Implemente `createRole` e `assignPermission` (métodos auxiliares para o seed).

### 3. Script de Seed (`src/modules/iam/infra/seed.ts`)

* Crie uma função `seedIAM()` que utiliza o `IAMRepository` ou queries diretas (`sql`).
* Crie as permissões: `users:read`, `users:write`, `users:block`, `families:read`, `families:write`.
* Crie as Roles: `ADMIN` (todas as perms) e `OPERATOR` (apenas `families:*`).
* Use `ON CONFLICT DO NOTHING` para garantir que o script possa rodar várias vezes sem erro.

### 4. Middleware de Autorização (`src/modules/iam/http/auth.middleware.ts`)

* Middleware Hono `authMiddleware`:
* Valida o JWT.
* Recupera o usuário (se o token tiver apenas o ID, busque no repositório para ter as permissões atualizadas, ou confie no payload do token se decidirmos inflá-lo). *Para este MVP, busque no banco para garantir segurança máxima.*
* Injeta em `c.set('user', userEntity)`.


* Factory `requirePermission(slug: string)`:
* Verifica `c.get('user').can(slug)`.
* Retorna 403 se falhar.



### 5. Atualização do Entrypoint do Módulo (`src/modules/iam/iam.module.ts`)

* Exporte `createIAMModule()` retornando `Hono`.
* Configure as rotas (stubs para Login e Provisionamento).
* Exemplo de rota protegida: `app.get('/users', requirePermission('users:read'), (c) => ...)`

**Regras de Código:**

* Use **Strict Types**.
* Use **Tagged Templates** do Bun (`await sql`SELECT...``) para segurança.
* Não use bibliotecas externas de ORM.
* Mantenha o código limpo e seguindo Clean Architecture (Infra implementa Domínio).

```

***

### Próximos Passos (Para você executar):

1.  **Crie a Migration:** Antes de rodar o código gerado, você precisa garantir que as tabelas existam no Postgres. Posso gerar o arquivo `.sql` exato para você rodar no seu banco se quiser.
2.  **Ajuste o `src/infra/database/postgress/postgres.ts`:** Verifiquei seu arquivo e ele parece estar usando uma classe. Certifique-se de que ele exporta uma instância utilizável do `sql` do Bun ou ajuste o prompt acima para importar corretamente (ex: `import { PostgresDB } from ...`). *Se ele estiver muito complexo, podemos simplificá-lo para apenas exportar o `const sql = Bun.sql(...)` nativo.*

```