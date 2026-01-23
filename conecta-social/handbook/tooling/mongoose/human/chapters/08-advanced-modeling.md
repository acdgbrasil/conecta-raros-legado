# 08 - Modelagem avancada

## Objetivo

Apresentar tecnicas de modelagem como discriminators e schemas compostos.

## Conceitos principais

- Discriminators suportam heranca em colecoes.
- Schemas compostos permitem reutilizacao.
- Modelagem deve seguir acessos reais, nao so dominio.

## Quando usar

- Quando ha variacoes de um mesmo tipo de documento.
- Para reutilizar partes comuns de schemas.

## Armadilhas comuns

- Discriminators sem necessidade real.
- Schema excessivamente generico.
- Complexidade dificil de manter.

## Checklist humano

- Discriminators com base clara e campos comuns.
- Reuso de schema sem duplicar regras.
- Consultas e indices alinhados.

## Exemplos e reforco

### Exemplo

```js
const baseSchema = new mongoose.Schema({
  kind: { type: String, required: true },
  name: String,
}, { discriminatorKey: 'kind' });

const Event = mongoose.model('Event', baseSchema);
const ClickEvent = Event.discriminator('Click', new mongoose.Schema({
  url: String,
}));
```

### Exemplo bom

```js
const clicks = await Event.find({ kind: 'Click' });
```

### Exemplo ruim

```js
// If the fields do not overlap at all, consider separate collections.
```

### Exemplo

```js
const options = { discriminatorKey: 'kind' };
const base = new mongoose.Schema({ createdAt: Date }, options);

const commentSchema = new mongoose.Schema({
  items: [base],
});

commentSchema.path('items').discriminator('Text', new mongoose.Schema({ text: String }));
commentSchema.path('items').discriminator('Image', new mongoose.Schema({ url: String }));
```

### Exemplo

```js
const addressSchema = new mongoose.Schema({
  line1: String,
  city: String,
  country: String,
});

const userSchema = new mongoose.Schema({
  shipping: addressSchema,
  billing: addressSchema,
});
```

### Exemplo

```js
const schema = new mongoose.Schema({
  secrets: { type: String, select: false },
  tags: [{ type: String, index: true }],
});
```

### Exemplo bom

```js
const eventBucketSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  day: { type: String, index: true },
  events: [{ type: String }],
});
```

### Exemplo ruim

```js
const eventSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  type: String,
});
```

### Exemplo

```js
const placeSchema = new mongoose.Schema({
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
  },
});

placeSchema.index({ location: '2dsphere' });
```

## Referencias

- Versao para IA: ../../ai/chapters/08-advanced-modeling.md
- Capitulo original: ../../chapters/08-advanced-modeling.md
