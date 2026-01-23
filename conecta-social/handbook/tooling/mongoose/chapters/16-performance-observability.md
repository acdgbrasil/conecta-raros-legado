# 16 - Performance, Indices e Observabilidade (PT-BR)
<a id="pt-br"></a>

Conteudo adaptado de:
- [aux_1/mongoose-ai-docs/12-performance-observabilidade.md](../../../aux_1/mongoose-ai-docs/12-performance-observabilidade.md)
- [aux_2/mongoose-docs/09-indices-performance.md](../../../aux_2/mongoose-docs/09-indices-performance.md)

## Objetivo

Medir e otimizar consultas reais, com observabilidade e indices corretos.

## Observabilidade e debug

### Exemplo bom

```ts
import mongoose from "mongoose";

export function enableMongoDebug() {
  mongoose.set("debug", (collection, method, query, doc, options) => {
    console.log("[mongo]", collection, method, query, doc, options);
  });
}
```

### Exemplo ruim

```ts
mongoose.set("debug", true);
```

Por que e ruim:

- Log verboso sem controle.
- Pode vazar dados sensiveis.

### Dicas

- Use `explain()` no Mongo shell para validar indices.
- Defina limites padrao para queries.
- Use `projection` para evitar payloads grandes.

### Checklist

- `lean()` quando possivel?
- Logs com mascara para dados sensiveis?
- Indices avaliados em consultas reais?

## Cursors e streaming

```ts
import { UserModel } from "../models/user.model";

export async function streamUsers() {
  const cursor = UserModel.find({ status: "active" })
    .lean()
    .cursor();

  for await (const doc of cursor) {
    console.log(doc.email);
  }
}
```

## Timeouts

```ts
export async function listWithTimeout() {
  return UserModel.find({})
    .maxTimeMS(200)
    .limit(50)
    .lean()
    .exec();
}
```

### Checklist extra

- `maxTimeMS` usado em endpoints criticos?
- Cursor usado em lotes grandes?

## Indices e performance

### Good examples

```js
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  status: { type: String, index: true },
});
```

```js
// Em producao, evite autoIndex e sincronize conscientemente
mongoose.set("autoIndex", false);
await User.syncIndexes();
```

### Bad examples

```js
// Depender de scan em colecao grande
const users = await User.find({ status: "active" });
```

### Checklist rapido

- Indices existem para filtros frequentes?
- Indices sao criados de forma controlada em prod?
- Ha indice composto quando necessario?

---

<a id="en"></a>

# English Version

## Goal

Measure and optimize real queries with observability and correct indexes.

## Observability and debug

### Good example

```ts
import mongoose from "mongoose";

export function enableMongoDebug() {
  mongoose.set("debug", (collection, method, query, doc, options) => {
    console.log("[mongo]", collection, method, query, doc, options);
  });
}
```

### Bad example

```ts
mongoose.set("debug", true);
```

Why it is bad:

- Verbose logs without control.
- Can leak sensitive data.

### Tips

- Use `explain()` in the Mongo shell to validate indexes.
- Set default query limits.
- Use `projection` to avoid large payloads.

### Checklist

- `lean()` when possible?
- Logs masked for sensitive data?
- Indexes validated with real queries?

## Cursors and streaming

```ts
import { UserModel } from "../models/user.model";

export async function streamUsers() {
  const cursor = UserModel.find({ status: "active" })
    .lean()
    .cursor();

  for await (const doc of cursor) {
    console.log(doc.email);
  }
}
```

## Timeouts

```ts
export async function listWithTimeout() {
  return UserModel.find({})
    .maxTimeMS(200)
    .limit(50)
    .lean()
    .exec();
}
```

### Extra checklist

- `maxTimeMS` used in critical endpoints?
- Cursor used for large batches?

## Indexes and performance

### Good examples

```js
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  status: { type: String, index: true },
});
```

```js
// In production, avoid autoIndex and sync intentionally
mongoose.set("autoIndex", false);
await User.syncIndexes();
```

### Bad examples

```js
// Relying on a collection scan in a large collection
const users = await User.find({ status: "active" });
```

### Quick checklist

- Indexes exist for frequent filters?
- Indexes are created in a controlled way in prod?
- Composite index when needed?
