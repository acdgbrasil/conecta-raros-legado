---
title: "10 - Performance e seguranca"
chapter: "10"
lang: "pt-BR"
audience: "human"
tags: ["mongoose", "docs", "pt-br", "human"]
---

# 10 - Performance e seguranca

## Navegacao rapida

- [[#Objetivo]]
- [[#Conceitos principais]]
- [[#Quando usar]]
- [[#Armadilhas comuns]]
- [[#Checklist humano]]
- [[#Exemplos e reforco]]
- [[#Referencias]]


## Objetivo

Dar base para consultas eficientes e seguras em producao.

## Conceitos principais

- Performance depende de indices e projeções.
- Seguranca exige validacao e controle de campos.
- Configuracoes de producao reduzem risco (ex: autoIndex).

## Quando usar

- Ao revisar endpoints criticos.
- Antes de ir para producao.

## Armadilhas comuns

- AutoIndex habilitado em prod.
- Query sem limites ou filtros.
- Expor dados sensiveis no response.

## Checklist humano

- Indices planejados e revisados.
- Projecoes e limites aplicados.
- Validacao e logs seguros.

## Exemplos e reforco

### Exemplo bom

```js
const page = await User.find({})
  .select('email name')
  .sort({ createdAt: -1 })
  .limit(50)
  .lean();
```

### Exemplo ruim

```js
await User.find({});
```

### Exemplo bom

```js
await User.bulkWrite([
  { updateOne: { filter: { _id: id1 }, update: { $set: { name: 'A' } } } },
  { updateOne: { filter: { _id: id2 }, update: { $set: { name: 'B' } } } },
]);
```

### Exemplo ruim

```js
await User.updateOne({ _id: id1 }, { $set: { name: 'A' } });
await User.updateOne({ _id: id2 }, { $set: { name: 'B' } });
```

### Exemplo

```js
schema.index({ email: 1 }, { unique: true });
```

### Exemplo

```js
const explain = await User.find({ email: 'a@b.com' }).explain();
```

### Exemplo bom

```js
const allowed = ['email', 'name'];
const filter = {};
for (const key of allowed) if (input[key]) filter[key] = input[key];
const users = await User.find(filter);
```

### Exemplo ruim

```js
// User can inject operators like $gt, $where.
await User.find(req.body.filter);
```

## Referencias

- Versao para IA: [[../ai/chapters/10-performance-and-security.md
- Capitulo original: [[../chapters/10-performance-and-security.md]]
