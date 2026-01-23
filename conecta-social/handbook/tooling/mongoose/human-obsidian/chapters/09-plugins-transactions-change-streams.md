---
title: "09 - Plugins, transacoes e change streams"
chapter: "09"
lang: "pt-BR"
audience: "human"
tags: ["mongoose", "docs", "pt-br", "human"]
---

# 09 - Plugins, transacoes e change streams

## Navegacao rapida

- [[#Objetivo]]
- [[#Conceitos principais]]
- [[#Quando usar]]
- [[#Armadilhas comuns]]
- [[#Checklist humano]]
- [[#Exemplos e reforco]]
- [[#Referencias]]


## Objetivo

Explicar extensoes de schema e recursos avancados de consistencia e eventos.

## Conceitos principais

- Plugins encapsulam comportamento reutilizavel.
- Transacoes garantem atomicidade em multiplas colecoes.
- Change streams permitem reagir a eventos do banco.

## Quando usar

- Quando precisa padronizar comportamentos repetidos.
- Ao atualizar varias colecoes de forma atomica.
- Para processamento reativo e auditoria.

## Armadilhas comuns

- Esquecer sessions nas operacoes transacionais.
- Transacoes longas ou grandes demais.
- Change streams sem controle de resume ou retry.

## Checklist humano

- Replica set habilitado para transacoes.
- Operacoes sempre na mesma session.
- Tratamento de erros e retries.

## Exemplos e reforco

### Exemplo

```js
function softDelete(schema) {
  schema.add({ isDeleted: { type: Boolean, default: false } });
  schema.pre('find', function() {
    this.where({ isDeleted: { $ne: true } });
  });
}

schema.plugin(softDelete);
```

### Exemplo ruim

```js
// Global plugins can surprise other models if not documented.
mongoose.plugin(softDelete);
```

### Exemplo ruim

```js
const session = await mongoose.startSession();
try {
  await session.withTransaction(async () => {
    await Account.updateOne({ _id: from }, { $inc: { balance: -10 } }, { session });
    await Account.updateOne({ _id: to }, { $inc: { balance: 10 } }, { session });
  });
} finally {
  session.endSession();
}
```

### Exemplo ruim

```js
// This breaks transactional guarantees.
await Account.updateOne({ _id: from }, { $inc: { balance: -10 } }, { session });
await Account.updateOne({ _id: to }, { $inc: { balance: 10 } });
```

### Exemplo bom

```js
await session.withTransaction(async () => {
  await Order.create([{ total: 10 }], { session });
});
```

### Exemplo ruim

```js
for (let i = 0; i < 3; i++) {
  await Order.create({ total: 10 });
}
```

### Exemplo

```js
const changeStream = Order.watch();
changeStream.on('change', (change) => {
  console.log(change.operationType, change.documentKey);
});
```

### Exemplo bom

```js
process.on('SIGTERM', async () => {
  await changeStream.close();
});
```

## Referencias

- Versao para IA: [[../ai/chapters/09-plugins-transactions-change-streams.md
- Capitulo original: [[../chapters/09-plugins-transactions-change-streams.md]]
