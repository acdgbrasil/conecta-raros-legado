---
title: "17 - Seguranca, multi-tenant e operacao"
chapter: "17"
lang: "pt-BR"
audience: "human"
tags: ["mongoose", "docs", "pt-br", "human"]
---

# 17 - Seguranca, multi-tenant e operacao

## Navegacao rapida

- [[#Objetivo]]
- [[#Conceitos principais]]
- [[#Quando usar]]
- [[#Armadilhas comuns]]
- [[#Checklist humano]]
- [[#Exemplos e reforco]]
- [[#Referencias]]


## Objetivo

Definir praticas seguras para multi-tenant e protecao de dados.

## Conceitos principais

- Filtros por tenant devem estar em todas as queries.
- Campos sensiveis devem ser excluidos por padrao.
- Whitelists protegem contra query injection.

## Quando usar

- Em apps SaaS com varios clientes.
- Para endpoints publicos ou expostos.

## Armadilhas comuns

- `findById` sem tenantId.
- Montar query a partir de req.query.
- Expor erros internos no response.

## Checklist humano

- TenantId presente em schemas e filtros.
- Projecao explicita em respostas.
- Logs sem dados sensiveis.

## Exemplos e reforco

### Exemplo bom

```ts
import { Schema, model } from "mongoose";

const projectSchema = new Schema({
  tenantId: { type: String, required: true },
  name: { type: String, required: true },
});

projectSchema.index({ tenantId: 1, name: 1 });

export const ProjectModel = model("Project", projectSchema);

export async function listProjects(tenantId: string) {
  return ProjectModel.find({ tenantId })
    .select("name")
    .lean()
    .exec();
}
```

### Exemplo ruim

```ts
export async function getProject(id: string) {
  return ProjectModel.findById(id).exec();
}
```

### Exemplo

```ts
const userSchema = new Schema({
  email: { type: String, required: true },
  passwordHash: { type: String, required: true, select: false },
});

export async function getUserSafe(id: string, tenantId: string) {
  return UserModel.findOne({ _id: id, tenantId })
    .select("email")
    .lean()
    .exec();
}
```

### Exemplo bom

```js
// Lista de campos permitidos
const allowedSort = ["createdAt", "name"];
const sortField = allowedSort.includes(req.query.sort) ? req.query.sort : "createdAt";

const users = await User.find()
  .sort({ [sortField]: 1 })
  .select("name email")
  .lean();
```

### Exemplo ruim

```js
// Query montada direto do request
const users = await User.find(req.query);
```

### Exemplo bom

```ts
import { Schema, model } from "mongoose";

const projectSchema = new Schema({
  tenantId: { type: String, required: true },
  name: { type: String, required: true },
});

projectSchema.index({ tenantId: 1, name: 1 });

export const ProjectModel = model("Project", projectSchema);

export async function listProjects(tenantId: string) {
  return ProjectModel.find({ tenantId })
    .select("name")
    .lean()
    .exec();
}
```

### Exemplo ruim

```ts
export async function getProject(id: string) {
  return ProjectModel.findById(id).exec();
}
```

### Exemplo

```ts
const userSchema = new Schema({
  email: { type: String, required: true },
  passwordHash: { type: String, required: true, select: false },
});

export async function getUserSafe(id: string, tenantId: string) {
  return UserModel.findOne({ _id: id, tenantId })
    .select("email")
    .lean()
    .exec();
}
```

### Exemplo bom

```js
// Allowed field list
const allowedSort = ["createdAt", "name"];
const sortField = allowedSort.includes(req.query.sort) ? req.query.sort : "createdAt";

const users = await User.find()
  .sort({ [sortField]: 1 })
  .select("name email")
  .lean();
```

### Exemplo ruim

```js
// Query built directly from request
const users = await User.find(req.query);
```

## Referencias

- Versao para IA: [[../ai/chapters/17-security-multitenant-ops.md
- Capitulo original: [[../chapters/17-security-multitenant-ops.md]]
