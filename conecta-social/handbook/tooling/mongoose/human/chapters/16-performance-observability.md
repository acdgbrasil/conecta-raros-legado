# 16 - Performance, indices e observabilidade

## Objetivo

Unir monitoramento, indices e praticas de performance em producao.

## Conceitos principais

- Logs ajudam a detectar gargalos reais.
- Indices certos reduzem latencia.
- Limites e timeouts protegem o app.

## Quando usar

- Ao otimizar endpoints criticos.
- Quando a base cresce e latencia aumenta.

## Armadilhas comuns

- Log verboso sem controle.
- Indices criados automaticamente em prod.
- Queries sem `lean` quando possivel.

## Checklist humano

- Indices sincronizados de forma controlada.
- Uso de `explain` para validar performance.
- Time limits definidos.

## Exemplos e reforco

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

### Exemplo

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

### Exemplo

```ts
export async function listWithTimeout() {
  return UserModel.find({})
    .maxTimeMS(200)
    .limit(50)
    .lean()
    .exec();
}
```

### Exemplo bom

```js
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  status: { type: String, index: true },
});
```

### Exemplo

```js
// Em producao, evite autoIndex e sincronize conscientemente
mongoose.set("autoIndex", false);
await User.syncIndexes();
```

### Exemplo ruim

```js
// Depender de scan em colecao grande
const users = await User.find({ status: "active" });
```

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

### Exemplo

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

### Exemplo

```ts
export async function listWithTimeout() {
  return UserModel.find({})
    .maxTimeMS(200)
    .limit(50)
    .lean()
    .exec();
}
```

### Exemplo bom

```js
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  status: { type: String, index: true },
});
```

### Exemplo

```js
// In production, avoid autoIndex and sync intentionally
mongoose.set("autoIndex", false);
await User.syncIndexes();
```

### Exemplo ruim

```js
// Relying on a collection scan in a large collection
const users = await User.find({ status: "active" });
```

## Referencias

- Versao para IA: ../../ai/chapters/16-performance-observability.md
- Capitulo original: ../../chapters/16-performance-observability.md
