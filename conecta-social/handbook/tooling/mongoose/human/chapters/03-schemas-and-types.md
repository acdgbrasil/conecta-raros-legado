# 03 - Schemas e tipos

## Objetivo

Detalhar como modelar dados com tipos corretos, defaults e validadores.

## Conceitos principais

- Schema e o contrato de dados e comportamento.
- Tipos consistentes evitam casting inesperado.
- Defaults e enums ajudam a manter consistencia.
- Indices ajudam performance e unicidade.

## Quando usar

- Ao criar ou revisar modelagem de colecoes.
- Quando precisar validar regras de negocio no nivel de dados.

## Armadilhas comuns

- Uso excessivo de `Mixed`.
- Campos com tipos ambiguos.
- Falta de indices para consultas frequentes.

## Checklist humano

- Tipos e required definidos.
- Defaults e enums quando aplicavel.
- Indices planejados para queries reais.

## Exemplos e reforco

### Exemplo bom

```js
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});
```

### Exemplo ruim

```js
const orderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
});
```

### Exemplo bom

```js
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['new', 'paid', 'shipped'], required: true },
  meta: { type: Map, of: String },
});
```

### Exemplo ruim

```js
const orderSchema = new mongoose.Schema({
  payload: mongoose.Schema.Types.Mixed
});
```

### Exemplo

```js
const schema = new mongoose.Schema({ name: String }, {
  strict: true,
  timestamps: true,
});
```

### Exemplo

```js
const schema = new mongoose.Schema({ name: String }, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});
```

### Exemplo bom

```js
const schema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
});
```

### Exemplo ruim

```js
const schema = new mongoose.Schema({
  createdAt: { type: Date, default: new Date() },
});
```

### Exemplo

```js
const schema = new mongoose.Schema({
  tags: [{ type: String, index: true }],
  features: { type: Map, of: String },
});
```

### Exemplo bom

```js
const schema = new mongoose.Schema({
  scores: [{ type: Number, min: 0, max: 100 }],
});
```

### Exemplo ruim

```js
const schema = new mongoose.Schema({
  data: [mongoose.Schema.Types.Mixed],
});
```

### Exemplo

```js
const schema = new mongoose.Schema({
  email: {
    type: String,
    get: (v) => v?.toLowerCase(),
    set: (v) => v?.trim(),
  }
});
```

### Exemplo

```js
schema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});
```

### Exemplo

```js
const schema = new mongoose.Schema({
  type: { type: String, required: true },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    required: function() { return this.type === 'company'; },
  },
});
```

### Exemplo

```js
const schema = new mongoose.Schema({
  tenantId: { type: String, immutable: true },
});
```

### Exemplo

```js
class UppercaseString extends mongoose.SchemaType {
  cast(val) {
    if (val == null) return val;
    return String(val).toUpperCase();
  }
}

mongoose.Schema.Types.UppercaseString = UppercaseString;

const schema = new mongoose.Schema({
  code: { type: UppercaseString, required: true },
});
```

### Exemplo

```js
schema.index({ email: 1 }, { unique: true });
```

### Exemplo

```js
schema.index({ userId: 1, createdAt: -1 });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### Exemplo ruim

```js
// TTL only works on Date fields.
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

## Referencias

- Versao para IA: ../../ai/chapters/03-schemas-and-types.md
- Capitulo original: ../../chapters/03-schemas-and-types.md
