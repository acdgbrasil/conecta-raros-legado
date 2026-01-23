# 11 - TypeScript and Testing

## Contents
- [TypeScript basics](#typescript-basics)
- [HydratedDocument](#hydrateddocument)
- [Query helpers, statics, methods](#query-helpers-statics-methods)
- [Statics](#statics)
- [Populate typing](#populate-typing)
- [Lean typing](#lean-typing)
- [Testing with Jest](#testing-with-jest)
- [AI agent checklist](#ai-agent-checklist)


## TypeScript basics
Use `Schema<T>` and model generics for strong typing.

```ts
import mongoose, { Schema, InferSchemaType } from 'mongoose';

const userSchema = new Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
}, { timestamps: true });

type User = InferSchemaType<typeof userSchema>;
export const UserModel = mongoose.model<User>('User', userSchema);
```

## HydratedDocument
Use `HydratedDocument` for document instances.

```ts
import type { HydratedDocument } from 'mongoose';

type UserDoc = HydratedDocument<User>;
```

## Query helpers, statics, methods
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

## Statics
```ts
interface UserModel extends mongoose.Model<User, {}, UserMethods> {
  findActive(): Promise<User[]>;
}

userSchema.static('findActive', function() {
  return this.find({ isActive: true });
});
```

## Populate typing
Use explicit typings or helper types when populating.

Good example
```ts
const user = await UserModel.findById(id).populate('team').orFail();
```

Bad example: assume populated types without guards
```ts
// team could be ObjectId unless you typed it correctly
console.log(user.team.name);
```

## Lean typing
Use `LeanDocument` or explicit interfaces for lean results.

```ts
const users = await UserModel.find({}).lean();
```

## Testing with Jest
Use a dedicated test database and clean between tests.

```js
beforeAll(async () => {
await mongoose.connect(process.env.MONGO_URL);
});

afterAll(async () => {
await mongoose.disconnect();
});
```

Good example: clear collections
```js
await mongoose.connection.db.dropDatabase();
```

Bad example: reuse production database for tests
```js
await mongoose.connect(process.env.PROD_MONGO_URL);
```

## AI agent checklist
- Use `InferSchemaType` to avoid duplicated types.
- Ensure tests use isolated databases.
- Validate populated fields before dereferencing.
