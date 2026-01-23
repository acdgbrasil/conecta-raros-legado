# 19 - Arquitetura e Guia de Agentes (PT-BR)
<a id="pt-br"></a>

Conteudo adaptado de:
- [aux_1/mongoose-ai-docs/16-arquitetura-projeto.md](../../../aux_1/mongoose-ai-docs/16-arquitetura-projeto.md)
- [aux_1/mongoose-ai-docs/17-guia-agentes-ia.md](../../../aux_1/mongoose-ai-docs/17-guia-agentes-ia.md)

## Arquitetura de projeto

### Objetivo

Organizar o codigo para separar dominio, persistencia e transporte.

### Padrao sugerido

```
src/
  db/
    connect.ts
  models/
    user.model.ts
  repositories/
    user.repo.ts
  services/
    user.service.ts
  api/
    user.controller.ts
```

### Exemplo bom

```ts
// repositories/user.repo.ts
import { UserModel } from "../models/user.model";

export async function findUserByEmail(email: string) {
  return UserModel.findOne({ email }).lean().exec();
}
```

```ts
// services/user.service.ts
import { findUserByEmail } from "../repositories/user.repo";

export async function getUserProfile(email: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("user not found");
  return user;
}
```

Por que e bom:

- Repositorio isolado de regras de dominio.
- Service centraliza regras.

### Exemplo ruim

```ts
// controllers/user.controller.ts
import { UserModel } from "../models/user.model";

export async function handler(req: any) {
  return UserModel.find({}).exec();
}
```

Por que e ruim:

- Controller acessa DB direto.
- Mistura responsabilidades.

### Checklist

- Regras de negocio fora do controller?
- Repositorio so faz persistencia?
- Services tem testes unitarios?

### Repository com filtros globais

```ts
// repositories/project.repo.ts
import { ProjectModel } from "../models/project.model";

export function listProjectsByTenant(tenantId: string) {
  return ProjectModel.find({ tenantId }).lean().exec();
}
```

### Checklist extra

- Repositorios recebem contexto (tenantId, userId)?
- Controllers sem acesso direto ao model?

## Guia para agentes de IA

### Objetivo

Ajudar agentes de IA a usar esta documentacao com foco em codigo seguro e previsivel.

### Como um agente deve ler

- Primeiro, identificar o capitulo relevante.
- Ler os exemplos bons e ruins para comparar a solucao proposta.
- Confirmar checklist no final.

### Prompt sugerido para agentes

```
Leia o capitulo relacionado e proponha uma solucao com Mongoose em TypeScript.
Mostre um exemplo bom e um ruim. Resuma os riscos e indique indices necessarios.
```

### Anti-padroes a evitar

- Queries sem `limit` e `select`.
- Updates sem `runValidators`.
- Populate sem selecao de campos.
- `findById` sem restricao de tenant.

### Quando pedir esclarecimentos

- Nao esta claro se o dado deve ser embutido ou referenciado.
- Nao ha informacao sobre volume de dados.
- Nao ha definicao do dominio (enum, status, etc).

### Checklist

- O agente aplicou `lean` quando apropriado?
- O agente sugeriu indices?
- O agente mostrou exemplos bons e ruins?

### Checklist do agente antes de responder

- Confirmou se e embed ou referencia?
- Checou necessidade de indices?
- Aplicou `limit`, `select` e `lean`?
- Indicou `runValidators` em updates?

### Saida sugerida do agente

- Plano curto de abordagem.
- Codigo TypeScript com Mongoose.
- Exemplo bom e ruim.
- Riscos e trade-offs.

---

<a id="en"></a>

# English Version

## Project architecture

### Goal

Organize code to separate domain, persistence, and transport.

### Suggested structure

```
src/
  db/
    connect.ts
  models/
    user.model.ts
  repositories/
    user.repo.ts
  services/
    user.service.ts
  api/
    user.controller.ts
```

### Good example

```ts
// repositories/user.repo.ts
import { UserModel } from "../models/user.model";

export async function findUserByEmail(email: string) {
  return UserModel.findOne({ email }).lean().exec();
}
```

```ts
// services/user.service.ts
import { findUserByEmail } from "../repositories/user.repo";

export async function getUserProfile(email: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("user not found");
  return user;
}
```

Why it is good:

- Repository isolated from domain rules.
- Service centralizes rules.

### Bad example

```ts
// controllers/user.controller.ts
import { UserModel } from "../models/user.model";

export async function handler(req: any) {
  return UserModel.find({}).exec();
}
```

Why it is bad:

- Controller accesses DB directly.
- Mixed responsibilities.

### Checklist

- Business rules outside controllers?
- Repository only handles persistence?
- Services have unit tests?

### Repository with global filters

```ts
// repositories/project.repo.ts
import { ProjectModel } from "../models/project.model";

export function listProjectsByTenant(tenantId: string) {
  return ProjectModel.find({ tenantId }).lean().exec();
}
```

### Extra checklist

- Repositories receive context (tenantId, userId)?
- Controllers do not access models directly?

## AI agent guide

### Goal

Help AI agents use this documentation with safe, predictable code.

### How an agent should read

- Identify the relevant chapter.
- Read good and bad examples to compare.
- Confirm the checklist at the end.

### Suggested prompt for agents

```
Read the related chapter and propose a solution with Mongoose in TypeScript.
Show a good and a bad example. Summarize risks and required indexes.
```

### Anti-patterns to avoid

- Queries without `limit` and `select`.
- Updates without `runValidators`.
- Populate without field selection.
- `findById` without tenant restriction.

### When to ask for clarification

- It is not clear whether data should be embedded or referenced.
- No information about data volume.
- No domain definition (enum, status, etc).

### Checklist

- Agent applied `lean` when appropriate?
- Agent suggested indexes?
- Agent showed good and bad examples?

### Agent checklist before responding

- Confirmed embed vs reference?
- Checked index needs?
- Applied `limit`, `select`, and `lean`?
- Mentioned `runValidators` in updates?

### Suggested agent output

- Short approach plan.
- TypeScript code with Mongoose.
- Good and bad example.
- Risks and trade-offs.
