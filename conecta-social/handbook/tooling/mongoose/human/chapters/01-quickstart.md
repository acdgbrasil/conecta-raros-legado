# 01 - Inicio rapido

## Objetivo

Mostrar o fluxo minimo para conectar, definir schemas e executar CRUD com Mongoose.

## Conceitos principais

- Conexao deve ser iniciada uma vez e reutilizada.
- Schema define estrutura, validacao e comportamento do documento.
- Model encapsula consultas e operacoes de escrita.

## Quando usar

- Para subir o primeiro servico com Mongoose.
- Ao criar um prototipo com estrutura minima e correta.

## Armadilhas comuns

- Abrir nova conexao por request.
- Ignorar erros de conexao e falhas de escrita.
- Usar queries sem limite ou selecao de campos.

## Checklist humano

- Conexao centralizada e com tratamento de erro.
- Schema com campos obrigatorios e tipos definidos.
- CRUD com `await` e `try/catch`.

## Exemplos e reforco

### Exemplo

```bash
npm install mongoose
```

### Exemplo bom

```js
const uri = process.env.MONGO_URL;
if (!uri) throw new Error('MONGO_URL is required');
```

### Exemplo ruim

```js
// Hard-coded credentials in source code.
await mongoose.connect('mongodb://user:pass@host/db');
```

### Exemplo bom

```js
import mongoose from 'mongoose';

export async function connectMongo(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
}
```

### Exemplo ruim

```js
// Causes multiple connections and memory leaks.
await mongoose.connect(process.env.MONGO_URL);
// ... repeated in many files
```

### Exemplo

```js
export const User = mongoose.models.User || mongoose.model('User', userSchema);
```

### Exemplo

```js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, index: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
```

### Exemplo bom

```js
const user = await User.create({ email: 'a@b.com', name: 'Ada' });
```

### Exemplo ruim

```js
// This bypasses schema validation.
await User.collection.insertOne({ email: 123, name: null });
```

### Exemplo

```js
const user = await User.findOne({ email: 'a@b.com' }).lean();
```

### Exemplo bom

```js
const user = await User.findOne({ email: 'a@b.com' }).select('email name').lean();
```

### Exemplo ruim

```js
// Might include hashed passwords or tokens if not excluded.
const user = await User.findOne({ email: 'a@b.com' }).lean();
```

### Exemplo bom

```js
const updated = await User.findOneAndUpdate(
  { email: 'a@b.com' },
  { $set: { name: 'Ada Lovelace' } },
  { new: true, runValidators: true }
);
```

### Exemplo ruim

```js
// Overwrites fields not in the update.
await User.replaceOne({ email: 'a@b.com' }, { name: 'Ada' });
```

### Exemplo bom

```js
await User.updateOne(
  { email: 'a@b.com' },
  { $setOnInsert: { email: 'a@b.com', name: 'Ada' } },
  { upsert: true }
);
```

### Exemplo ruim

```js
// This can overwrite fields on existing docs.
await User.updateOne({ email: 'a@b.com' }, { name: 'Ada' }, { upsert: true });
```

### Exemplo

```js
await User.deleteOne({ email: 'a@b.com' });
```

### Exemplo bom

```js
const users = await User.find({}).limit(10);
```

### Exemplo ruim

```js
// Hard to reason about and easy to double-execute.
User.find({}, (err, docs) => {
  if (err) return;
});
const docs = await User.find({});
```

### Exemplo

```js
const users = await User.find({ isActive: true }).exec();
```

### Exemplo bom

```js
try {
  await User.create({ email: 'bad', name: 'Ada' });
} catch (err) {
  // Handle ValidationError, CastError, or MongoServerError
  console.error(err.name, err.message);
}
```

## Referencias

- Versao para IA: ../../ai/chapters/01-quickstart.md
- Capitulo original: ../../chapters/01-quickstart.md
