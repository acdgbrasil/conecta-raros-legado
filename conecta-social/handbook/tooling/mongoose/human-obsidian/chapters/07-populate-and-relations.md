---
title: "07 - Populate e relacoes"
chapter: "07"
lang: "pt-BR"
audience: "human"
tags: ["mongoose", "docs", "pt-br", "human"]
---

# 07 - Populate e relacoes

## Navegacao rapida

- [[#Objetivo]]
- [[#Conceitos principais]]
- [[#Quando usar]]
- [[#Armadilhas comuns]]
- [[#Checklist humano]]
- [[#Exemplos e reforco]]
- [[#Referencias]]


## Objetivo

Mostrar como relacionar documentos e quando usar populate.

## Conceitos principais

- Referencias guardam IDs e resolvem dados quando necessario.
- Populate deve selecionar apenas os campos usados.
- Virtual populate evita redundancia de dados.

## Quando usar

- Quando dados de outra colecao sao necessarios no response.
- Para manter documentos pequenos e normalizados.

## Armadilhas comuns

- Populate sem selecao de campos (payload grande).
- N+1 queries e cascatas de populate.
- Populate em listas muito grandes sem pagina.

## Checklist humano

- Populate com `select` e limites.
- Indices em campos de referencia.
- Evitar populate em massa quando nao necessario.

## Exemplos e reforco

### Exemplo

```js
const post = await Post.findById(id).populate('author');
```

### Exemplo bom

```js
const post = await Post.findById(id)
  .populate({ path: 'author', select: 'email name' })
  .lean();
```

### Exemplo ruim

```js
await Post.findById(id)
  .populate('author')
  .populate('comments.user')
  .populate('comments.user.team')
  .populate('comments.user.team.org');
```

### Exemplo

```js
const posts = await Post.find({})
  .populate({ path: 'author', match: { isActive: true }, select: 'email name' })
  .lean();
```

### Exemplo ruim

```js
const post = await Post.findById(id).populate('author');
post.author.email; // author can be null if not found
```

### Exemplo

```js
postSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'postId',
});
```

### Exemplo

```js
const schema = new mongoose.Schema({
  itemType: { type: String, enum: ['Post', 'Comment'] },
  itemId: { type: mongoose.Schema.Types.ObjectId, refPath: 'itemType' },
});
```

### Exemplo

```js
mongoose.set('strictPopulate', true);
```

## Referencias

- Versao para IA: [[../ai/chapters/07-populate-and-relations.md
- Capitulo original: [[../chapters/07-populate-and-relations.md]]
