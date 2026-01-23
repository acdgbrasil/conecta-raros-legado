---
title: "15 - Agregacoes"
chapter: "15"
lang: "pt-BR"
audience: "human"
tags: ["mongoose", "docs", "pt-br", "human"]
---

# 15 - Agregacoes

## Navegacao rapida

- [[#Objetivo]]
- [[#Conceitos principais]]
- [[#Quando usar]]
- [[#Armadilhas comuns]]
- [[#Checklist humano]]
- [[#Exemplos e reforco]]
- [[#Referencias]]


## Objetivo

Explicar pipelines de agregacao para analises sem trazer dados para a app.

## Conceitos principais

- Agregacao executa calculos no banco.
- Estagios como `match` e `project` reduzem custo.
- `lookup` permite joins controlados.

## Quando usar

- Para relatorios, totals e analytics.
- Quando a logica seria pesada no app.

## Armadilhas comuns

- Executar agregacao sem filtros iniciais.
- Desnormalizar sem necessidade.
- Pipelines grandes sem `allowDiskUse`.

## Checklist humano

- Filtros no inicio do pipeline.
- Projecao para reduzir campos.
- Indices que suportam `match`.

## Exemplos e reforco

### Exemplo bom

```ts
import mongoose from "mongoose";
import { OrderModel } from "../models/order.model";

export async function totalByUser(userId: string) {
  const result = await OrderModel.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: "$userId", total: { $sum: "$total" } } },
  ]).exec();

  return result[0]?.total ?? 0;
}
```

### Exemplo ruim

```ts
export async function totalByUser(userId: string) {
  const orders = await OrderModel.find({ userId }).lean();
  return orders.reduce((acc, o) => acc + o.total, 0);
}
```

### Exemplo

```ts
export async function listOrdersWithUsers() {
  return OrderModel.aggregate([
    { $match: { status: "paid" } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $project: { total: 1, "user.email": 1 } },
  ]).exec();
}
```

### Exemplo

```ts
export async function listOrdersWithCount() {
  return OrderModel.aggregate([
    { $match: { status: "paid" } },
    {
      $facet: {
        items: [{ $sort: { createdAt: -1 } }, { $limit: 20 }],
        total: [{ $count: "count" }],
      },
    },
  ]).exec();
}
```

### Exemplo bom

```ts
import mongoose from "mongoose";
import { OrderModel } from "../models/order.model";

export async function totalByUser(userId: string) {
  const result = await OrderModel.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: "$userId", total: { $sum: "$total" } } },
  ]).exec();

  return result[0]?.total ?? 0;
}
```

### Exemplo ruim

```ts
export async function totalByUser(userId: string) {
  const orders = await OrderModel.find({ userId }).lean();
  return orders.reduce((acc, o) => acc + o.total, 0);
}
```

### Exemplo

```ts
export async function listOrdersWithUsers() {
  return OrderModel.aggregate([
    { $match: { status: "paid" } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $project: { total: 1, "user.email": 1 } },
  ]).exec();
}
```

### Exemplo

```ts
export async function listOrdersWithCount() {
  return OrderModel.aggregate([
    { $match: { status: "paid" } },
    {
      $facet: {
        items: [{ $sort: { createdAt: -1 } }, { $limit: 20 }],
        total: [{ $count: "count" }],
      },
    },
  ]).exec();
}
```

## Referencias

- Versao para IA: [[../ai/chapters/15-aggregations.md
- Capitulo original: [[../chapters/15-aggregations.md]]
