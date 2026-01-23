# 06 - Validacao e middleware

## Objetivo

Cobrir validacao de dados e hooks para manter regras consistentes.

## Conceitos principais

- Validacao garante integridade antes de gravar.
- Middleware permite padronizar comportamento em create/update/remove.
- `runValidators` e essencial em updates.

## Quando usar

- Para reforcar regras no nivel de dados.
- Quando precisar executar logica antes/depois de operacoes.

## Armadilhas comuns

- Hooks com efeitos colaterais pesados.
- Esquecer `runValidators` em updates.
- Erros nao tratados de validacao.

## Checklist humano

- Validadores simples e previsiveis.
- Middleware com responsabilidade clara.
- Updates com `runValidators`.

## Exemplos e reforco

### Exemplo

```js
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, match: /@/ },
  age: { type: Number, min: 0, max: 120 },
});
```

### Exemplo bom

```js
await User.updateOne(
  { _id },
  { $set: { age: -1 } },
  { runValidators: true }
);
```

### Exemplo ruim

```js
// Without runValidators, this writes invalid data.
await User.updateOne({ _id }, { $set: { age: -1 } });
```

### Exemplo

```js
const schema = new mongoose.Schema({
  sku: {
    type: String,
    validate: {
      validator: (v) => /^SKU-/.test(v),
      message: 'SKU must start with SKU-',
    },
  },
});
```

### Exemplo

```js
const schema = new mongoose.Schema({
  slug: {
    type: String,
    validate: {
      validator: async function(v) {
        const exists = await mongoose.model('Post').exists({ slug: v });
        return !exists;
      },
      message: 'Slug already in use',
    },
  },
});
```

### Exemplo ruim

```js
// A unique index is still required to guarantee uniqueness.
```

### Exemplo

```js
schema.pre('save', function(next) {
  if (this.isModified('email')) this.email = this.email.toLowerCase();
  next();
});
```

### Exemplo bom

```js
schema.pre('save', async function() {
  if (this.isNew) this.createdAt = new Date();
});
```

### Exemplo ruim

```js
schema.pre('save', async function() {
  await riskyCall();
  // If riskyCall throws and you do not handle it, the error is unstructured.
});
```

### Exemplo

```js
schema.post('save', function(doc) {
  console.log('Saved', doc._id);
});
```

### Exemplo

```js
schema.pre('find', function() {
  this.where({ isDeleted: { $ne: true } });
});
```

### Exemplo

```js
schema.pre('save', function(next) {
  try {
    // work
    next();
  } catch (err) {
    next(err);
  }
});
```

## Referencias

- Versao para IA: ../../ai/chapters/06-validation-and-middleware.md
- Capitulo original: ../../chapters/06-validation-and-middleware.md
