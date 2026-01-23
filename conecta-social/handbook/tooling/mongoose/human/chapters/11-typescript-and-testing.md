# 11 - TypeScript e testes

## Objetivo

Unir tipagem correta com testes confiaveis de modelos e servicos.

## Conceitos principais

- Inferencia de tipos evita `any` e erros silenciosos.
- Testes isolam o comportamento do modelo.
- Ambientes de teste exigem conexoes controladas.

## Quando usar

- Ao padronizar modelos em TS.
- Para garantir regressao controlada.

## Armadilhas comuns

- Tipos divergentes do schema real.
- Testes com conexao compartilhada sem limpeza.
- Mocks que nao refletem o banco real.

## Checklist humano

- Tipos derivados do schema.
- Setup/teardown de conexao nos testes.
- Testes cobrindo validacao e middleware.

## Exemplos e reforco

### Exemplo

```ts
import mongoose, { Schema, InferSchemaType } from 'mongoose';

const userSchema = new Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
}, { timestamps: true });

type User = InferSchemaType<typeof userSchema>;
export const UserModel = mongoose.model<User>('User', userSchema);
```

### Exemplo

```ts
import type { HydratedDocument } from 'mongoose';

type UserDoc = HydratedDocument<User>;
```

### Exemplo

```ts
interface UserMethods {
  isEmailVerified(): boolean;
}

const userSchema = new Schema<User, mongoose.Model<User, {}, UserMethods>, UserMethods>({
  email: String,
  verifiedAt: Date,
});

userSchema.methods.isEmailVerified = function() {
  return !!this.verifiedAt;
};
```

### Exemplo

```ts
interface UserModel extends mongoose.Model<User, {}, UserMethods> {
  findActive(): Promise<User[]>;
}

userSchema.static('findActive', function() {
  return this.find({ isActive: true });
});
```

### Exemplo bom

```ts
const user = await UserModel.findById(id).populate('team').orFail();
```

### Exemplo ruim

```ts
// team could be ObjectId unless you typed it correctly
console.log(user.team.name);
```

### Exemplo

```ts
const users = await UserModel.find({}).lean();
```

### Exemplo

```js
beforeAll(async () => {
await mongoose.connect(process.env.MONGO_URL);
});

afterAll(async () => {
await mongoose.disconnect();
});
```

### Exemplo bom

```js
await mongoose.connection.db.dropDatabase();
```

### Exemplo ruim

```js
await mongoose.connect(process.env.PROD_MONGO_URL);
```

## Referencias

- Versao para IA: ../../ai/chapters/11-typescript-and-testing.md
- Capitulo original: ../../chapters/11-typescript-and-testing.md
