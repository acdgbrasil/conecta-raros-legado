---
title: "19 - Arquitetura e guia de agentes"
chapter: "19"
lang: "pt-BR"
audience: "human"
tags: ["mongoose", "docs", "pt-br", "human"]
---

# 19 - Arquitetura e guia de agentes

## Navegacao rapida

- [[#Objetivo]]
- [[#Conceitos principais]]
- [[#Quando usar]]
- [[#Armadilhas comuns]]
- [[#Checklist humano]]
- [[#Exemplos e reforco]]
- [[#Referencias]]


## Objetivo

Separar responsabilidades no codigo e orientar uso por agentes de IA.

## Conceitos principais

- Repositorios isolam persistencia.
- Servicos concentram regras de negocio.
- Agentes devem validar com exemplos e checklists.

## Quando usar

- Ao estruturar um novo projeto.
- Quando a equipe usa LLMs para gerar codigo.

## Armadilhas comuns

- Controllers acessando models direto.
- Regras de negocio espalhadas.
- Falta de criterios para avaliar output da IA.

## Checklist humano

- Camadas bem separadas.
- Repositorios recebem contexto (tenant, user).
- Agente segue checklists e exemplos.

## Exemplos e reforco

### Exemplo

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

### Exemplo

```ts
// services/user.service.ts
import { findUserByEmail } from "../repositories/user.repo";

export async function getUserProfile(email: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("user not found");
  return user;
}
```

### Exemplo ruim

```ts
// controllers/user.controller.ts
import { UserModel } from "../models/user.model";

export async function handler(req: any) {
  return UserModel.find({}).exec();
}
```

### Exemplo

```ts
// repositories/project.repo.ts
import { ProjectModel } from "../models/project.model";

export function listProjectsByTenant(tenantId: string) {
  return ProjectModel.find({ tenantId }).lean().exec();
}
```

### Exemplo

```
Leia o capitulo relacionado e proponha uma solucao com Mongoose em TypeScript.
Mostre um exemplo bom e um ruim. Resuma os riscos e indique indices necessarios.
```

### Exemplo

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

### Exemplo

```ts
// services/user.service.ts
import { findUserByEmail } from "../repositories/user.repo";

export async function getUserProfile(email: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("user not found");
  return user;
}
```

### Exemplo ruim

```ts
// controllers/user.controller.ts
import { UserModel } from "../models/user.model";

export async function handler(req: any) {
  return UserModel.find({}).exec();
}
```

### Exemplo

```ts
// repositories/project.repo.ts
import { ProjectModel } from "../models/project.model";

export function listProjectsByTenant(tenantId: string) {
  return ProjectModel.find({ tenantId }).lean().exec();
}
```

### Exemplo ruim

```
Read the related chapter and propose a solution with Mongoose in TypeScript.
Show a good and a bad example. Summarize risks and required indexes.
```

## Referencias

- Versao para IA: [[../ai/chapters/19-architecture-and-agents.md
- Capitulo original: [[../chapters/19-architecture-and-agents.md]]
