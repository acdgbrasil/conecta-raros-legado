---
title: "05 - Consultas e casting"
chapter: "05"
lang: "pt-BR"
audience: "human"
tags: ["mongoose", "docs", "pt-br", "human"]
---

# 05 - Consultas e casting

## Navegacao rapida

- [[#Objetivo]]
- [[#Conceitos principais]]
- [[#Quando usar]]
- [[#Armadilhas comuns]]
- [[#Checklist humano]]
- [[#Exemplos e reforco]]
- [[#Referencias]]


## Objetivo

Descrever como construir queries seguras e previsiveis com casting correto.

## Conceitos principais

- Casting converte tipos do input para tipos do schema.
- Projecao e `limit` controlam payload e custo.
- Ordenacao e paginacao devem usar indices.

## Quando usar

- Ao construir endpoints de leitura.
- Para padronizar filtros, pagina e ordenacao.

## Armadilhas comuns

- Queries sem `limit` ou `select`.
- Casting implicito de dados malformados.
- Filtros montados direto do request.

## Checklist humano

- Filtros validados e whitelists aplicadas.
- Uso de `select`, `limit` e `lean` quando possivel.
- Indices alinhados com filtros e ordenacao.

## Exemplos e reforco

### Exemplo

```js
const users = await User.find({ isActive: true })
  .select('email name')
  .sort({ createdAt: -1 })
  .limit(20)
  .lean();
```

### Exemplo bom

```js
const page = await User.find({ _id: { $gt: lastId } })
  .sort({ _id: 1 })
  .limit(50)
  .lean();
```

### Exemplo ruim

```js
// Large skip values can be slow.
await User.find({}).skip(50000).limit(50);
```

### Exemplo bom

```js
await User.findById('64d2f1d2b0d0a2a2a2a2a2a2');
```

### Exemplo ruim

```js
// This skips Mongoose casting and validation.
await User.collection.findOne({ _id: 'not-an-objectid' });
```

### Exemplo

```js
mongoose.set('strictQuery', true);
```

### Exemplo bom

```js
const filter = { email: input.email };
const users = await User.find(filter);
```

### Exemplo ruim

```js
await User.find({ emali: 'typo@example.com' });
```

### Exemplo bom

```js
const schema = new mongoose.Schema({
  email: { type: String, lowercase: true },
});
```

### Exemplo ruim

```js
// If client forgets, queries will miss matches.
await User.find({ email: 'USER@EXAMPLE.COM' });
```

### Exemplo bom

```js
const users = await User.find({ status: { $in: ['active', 'pending'] } });
```

### Exemplo ruim

```js
// Untrusted input can inject operators.
await User.find(req.body.filter);
```

### Exemplo bom

```js
await User.find({ email: /^ada@/i });
```

### Exemplo ruim

```js
await User.find({ email: /a/i });
```

### Exemplo

```js
schema.query.byStatus = function(status) {
  return this.where({ status });
};

const orders = await Order.find().byStatus('paid');
```

### Exemplo

```js
const doc = await User.findOneAndUpdate(
  { email },
  { $set: { name: 'Ada' } },
  { new: true, runValidators: true }
);
```

### Exemplo

```js
const results = await Order.aggregate([
  { $match: { status: 'paid' } },
  { $group: { _id: '$userId', total: { $sum: '$total' } } },
]);
```

### Exemplo

```js
const cursor = User.find({}).cursor();
for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
  // process doc
}
```

## Referencias

- Versao para IA: [[../ai/chapters/05-queries-and-casting.md
- Capitulo original: [[../chapters/05-queries-and-casting.md]]
