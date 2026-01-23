# 15 - Agregacoes (PT-BR)
<a id="pt-br"></a>

Conteudo adaptado de `aux_1/mongoose-ai-docs/11-agregacoes.md`. Para detalhes completos, veja o arquivo original:
- [aux_1/mongoose-ai-docs/11-agregacoes.md](../../../aux_1/mongoose-ai-docs/11-agregacoes.md)

## Objetivo

Criar consultas analiticas sem mover dados para a aplicacao.

## Conceitos

- Pipeline e uma sequencia de estagios.
- `match` deve vir cedo para reduzir volume.
- `project` limita campos.

## Exemplo bom

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

Por que e bom:

- Filtra cedo com `match`.
- Usa `group` direto.

## Exemplo ruim

```ts
export async function totalByUser(userId: string) {
  const orders = await OrderModel.find({ userId }).lean();
  return orders.reduce((acc, o) => acc + o.total, 0);
}
```

Por que e ruim:

- Puxa todos documentos para a app.
- Aumenta latencia e custo.

## Checklist

- `match` no inicio do pipeline?
- `project` para reduzir campos?
- Usa `allowDiskUse` quando necessario?

## Lookup (join)

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

## Facet para pagina + total

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

## Checklist extra

- `unwind` usado apenas quando precisa de array?
- `lookup` limitado com `project`?

---

<a id="en"></a>

# English Version

## Goal

Create analytical queries without moving data to the application.

## Concepts

- Pipeline is a sequence of stages.
- `match` should be early to reduce volume.
- `project` limits fields.

## Good example

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

Why it is good:

- Filters early with `match`.
- Uses `group` directly.

## Bad example

```ts
export async function totalByUser(userId: string) {
  const orders = await OrderModel.find({ userId }).lean();
  return orders.reduce((acc, o) => acc + o.total, 0);
}
```

Why it is bad:

- Pulls all documents to the app.
- Increases latency and cost.

## Checklist

- `match` at the start of the pipeline?
- `project` to reduce fields?
- Use `allowDiskUse` when needed?

## Lookup (join)

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

## Facet for page + total

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

## Extra checklist

- `unwind` only when you need to flatten arrays?
- `lookup` limited with `project`?
