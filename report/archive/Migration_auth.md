Perfeito, Gabriel. Como cientista da computação, você sabe que uma migração arquitetural sem plano é receita para o caos.

Preparei um **Plano de Migração Incremental (Strangler Fig Pattern)**. A ideia é isolar o novo módulo de IAM (Identity & Access Management) enquanto migramos a infraestrutura HTTP do Express para o Hono.

Aqui está o seu `MIGRATION_PLAN.md`. Você pode salvar na raiz do projeto e ir marcando o checkbox `[x]`.

---

# 🚀 Plano de Migração: IAM Enterprise & Hono Refactor

**Objetivo:** Migrar do Express para Hono, implementar RBAC (Provisionamento) e modularizar a autenticação para extração futura.

## 📦 Fase 1: Fundação & Infraestrutura

*O objetivo desta fase é preparar o terreno sem quebrar a aplicação rodando.*

* [ ] **1.1. Setup do Hono**
* Remover `express`, `@types/express`.
* Instalar Hono: `bun add hono`.
* Instalar middlewares úteis: `bun add hono/cors hono/logger`.


* [ ] **1.2. Atualização da Entidade de Domínio (`User`)**
* Arquivo: `src/domain/entity/user.ts`.
* Adicionar Enum `UserRole` ('ADMIN', 'OPERATOR', 'MANAGER').
* Adicionar propriedade `isActive: boolean` (default `true`).
* Adicionar propriedade `role: UserRole` (default `'OPERATOR'`).


* [ ] **1.3. Migração do Banco de Dados (Postgres)**
* Arquivo: `src/infra/database/postgress/schema/userSchema.ts` (ou migration script).
* Criar coluna `role` (VARCHAR/ENUM).
* Criar coluna `is_active` (BOOLEAN).
* **Script de Emergência:** Rodar update no banco para setar todos os usuários atuais como `isActive = true` e `role = 'ADMIN'` (para você não perder acesso).


* [ ] **1.4. Atualização do Token JWT**
* Arquivo: `src/infra/jwt/jwtToken.ts`.
* No método `sign`, incluir `role` e `email` no payload.
* Isso evitará consultas ao banco em cada request futuro.



---

## 🛡️ Fase 2: O Núcleo IAM (Identity & Access Management)

*Aqui criamos a "Lib Futura". Todo código novo deve viver isolado nesta estrutura.*

* [ ] **2.1. Criar Estrutura de Módulo**
* Criar pasta `src/modules/iam`.
* Criar subpastas: `domain`, `infra`, `useCases`, `middlewares`.


* [ ] **2.2. Implementar ACL (Políticas)**
* Arquivo: `src/modules/iam/domain/acl.ts`.
* Definir as permissões (ex: `user:create`, `family:read`).
* Criar função `can(role, permission)` para desacoplar a string da role da lógica de negócio.


* [ ] **2.3. Migrar Middleware de Auth (Hono Style)**
* Arquivo: `src/modules/iam/middlewares/authMiddleware.ts`.
* Criar `authMiddleware`: Verifica Token e injeta user no `c.set('user', payload)`.
* Criar `roleGuard(roles[])`: Verifica se `c.get('user').role` está na lista permitida.


* [ ] **2.4. Refatorar AuthController (Login Limpo)**
* Arquivo: `src/useCase/controllers/authController.ts` (Mover para `modules/iam/useCases` se desejar).
* Alterar assinatura: De `(req, res)` para `(c: Context)`.
* **Ação Crítica:** Remover método `register/signup`. Login deve apenas autenticar.


* [ ] **2.5. Refatorar AdmController (O Gerente)**
* Arquivo: `src/useCase/controllers/admController.ts`.
* Alterar assinatura para Hono `(c: Context)`.
* Implementar Feature: **Provisionamento** (Criar usuário com senha randômica + Email).
* Implementar Feature: **Listagem Raio-X** (Retornar ID, Nome, Email, Role, Status).
* Implementar Feature: **Update Parcial** (Alterar Role ou Status/Block).



---

## 🔌 Fase 3: Roteamento & Wiring (A Troca do Motor)

*Substituir o Express pelo Hono no ponto de entrada.*

* [ ] **3.1. Criar o Módulo IAM (Composition Root)**
* Arquivo: `src/modules/iam/iam.module.ts`.
* Exportar uma função `createIAMModule(deps)` que retorna uma instância de `Hono` com as rotas `/login` e `/admin/*` já configuradas com os middlewares novos.


* [ ] **3.2. Adaptar Controllers do Legado (Negócio)**
* *Nota:* Para os controllers de Família, Risco Social, etc., você precisará fazer uma refatoração "Find & Replace" inteligente.
* Trocar `req.body` por `await c.req.json()`.
* Trocar `req.params` por `c.req.param()`.
* Trocar `res.status(x).json(y)` por `return c.json(y, x)`.


* [ ] **3.3. O Novo Server Entrypoint**
* Arquivo: `src/index.ts`.
* Instanciar `const app = new Hono()`.
* Injetar dependências.
* Montar rotas: `app.route('/auth', iamModule)`.
* Montar legado: `app.route('/families', familyRouter)`.
* Exportar para o Bun: `export default { fetch: app.fetch, port: 3000 }`.



---

## 🧹 Fase 4: Limpeza & Frontend Check

*Garantir que nada ficou para trás.*

* [ ] **4.1. Validar Dashboard Admin**
* Testar via Postman/Insomnia:
* Login como Admin (Deve retornar Token com Role).
* Criar usuário Operador (Deve enviar email simulado/real).
* Tentar logar com Operador (Deve funcionar).
* Bloquear Operador (Deve impedir login subsequente).




* [ ] **4.2. Remoção de Código Morto**
* Apagar arquivos antigos de rotas do Express.
* Apagar DTOs de "SignUp" público.


* [ ] **4.3. Documentação**
* Atualizar Swagger/OpenAPI (se houver) para refletir que não existe mais Registro Público.



---

### 💡 Dicas de Ouro para a Execução

1. **Comece pelo `package.json`:** Garanta que o `bun` está rodando liso com o Hono antes de mexer na lógica complexa.
2. **Backup do Banco:** Antes da task 1.3, faça um dump do Postgres.
3. **Use o `c.json()`:** Lembre-se que no Hono você deve **retornar** a resposta. Se você esquecer o `return`, a requisição vai ficar pendurada (timeout).