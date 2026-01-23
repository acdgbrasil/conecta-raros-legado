---
title: "04 - Documentos e subdocumentos"
chapter: "04"
lang: "pt-BR"
audience: "human"
tags: ["mongoose", "docs", "pt-br", "human"]
---

# 04 - Documentos e subdocumentos

## Navegacao rapida

- [[#Objetivo]]
- [[#Conceitos principais]]
- [[#Quando usar]]
- [[#Armadilhas comuns]]
- [[#Checklist humano]]
- [[#Exemplos e reforco]]
- [[#Referencias]]


## Objetivo

Explicar como documentos e subdocumentos funcionam e quando embutir dados.

## Conceitos principais

- Documentos sao instancias com estado e metodos.
- Subdocumentos permitem modelar estruturas embutidas.
- `isModified` e `markModified` ajudam em atualizacoes complexas.

## Quando usar

- Ao decidir entre embed e referencia.
- Quando voce precisa de validacao e hooks em subestruturas.

## Armadilhas comuns

- Subdocumentos gigantes dificultam atualizacao.
- Uso de arrays sem limites.
- Atualizacoes parciais sem marcar modificacoes.

## Checklist humano

- Escolha embed vs ref baseada em acesso real.
- Subdocumentos com validacao clara.
- Atualizacoes com `markModified` quando necessario.

## Exemplos e reforco

### Exemplo bom

```js
const user = new User({ email: 'a@b.com', name: 'Ada' });
await user.save();
```

### Exemplo ruim

```js
const doc = await User.findOne({ email: 'a@b.com' }).lean();
// doc is plain JS object; no save() or validation
```

### Exemplo

```js
userSchema.methods.isActive = function() {
  return this.status === 'active';
};
```

### Exemplo

```js
user.name = 'New Name';
await user.save();
```

### Exemplo

```js
const doc = await User.findById(id);
doc.profile = { nickname: 'ada' };
doc.markModified('profile');
await doc.save();
```

### Exemplo

```js
const commentSchema = new mongoose.Schema({
  body: String,
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
  title: String,
  comments: [commentSchema],
});
```

### Exemplo bom

```js
const post = await Post.findById(id);
const comment = post.comments.id(commentId);
comment.body = 'Updated';
await post.save();
```

### Exemplo ruim

```js
// bypasses schema rules for comments
await Post.updateOne({ _id: id }, { $push: { comments: { body: 123 } } });
```

### Exemplo bom

```js
const schema = new mongoose.Schema({
  flags: [{ type: String }],
});
```

### Exemplo ruim

```js
// Consider a separate collection if this grows unbounded.
const schema = new mongoose.Schema({
  events: [eventSchema],
});
```

### Exemplo

```js
schema.set('toJSON', { virtuals: true });
```

### Exemplo bom

```js
const users = await User.find({ isActive: true }).lean();
```

### Exemplo ruim

```js
const user = await User.findById(id).lean();
user.save(); // not a function
```

### Exemplo

```js
const schema = new mongoose.Schema({
  expiresAt: { type: Date, required: true },
});
```

### Exemplo ruim

```js
const doc = await User.findById(id);
const copy = _.cloneDeep(doc);
await copy.save();
```

### Exemplo bom

```js
const doc = await User.findById(id);
const copy = new User().init(doc.toObject());
copy.name = 'Copy';
await copy.save();
```

### Exemplo bom

```js
const schema = new mongoose.Schema({ name: String }, {
  optimisticConcurrency: true,
});
```

### Exemplo ruim

```js
const doc = await User.findById(id);
doc.name = 'Ada';
await doc.save();
// Another write may have happened since the read.
```

## Referencias

- Versao para IA: [[../ai/chapters/04-documents-and-subdocs.md
- Capitulo original: [[../chapters/04-documents-and-subdocs.md]]
