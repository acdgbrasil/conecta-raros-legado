# 01 - Quickstart

## Contents
- [Install](#install)
- [Environment](#environment)
- [Connect](#connect)
- [Model registration guard (hot reload)](#model-registration-guard-hot-reload)
- [Define a schema and model](#define-a-schema-and-model)
- [Create](#create)
- [Read](#read)
- [Read with projection](#read-with-projection)
- [Update](#update)
- [Upsert](#upsert)
- [Delete](#delete)
- [Async/await and promises](#asyncawait-and-promises)
- [Promises and `exec()`](#promises-and-exec)
- [Error handling](#error-handling)
- [AI agent checklist](#ai-agent-checklist)


This chapter gets you from zero to working CRUD with safe defaults.

## Install
```bash
npm install mongoose
```

## Environment
Use environment variables for connection strings and keep secrets out of code.

Good example
```js
const uri = process.env.MONGO_URL;
if (!uri) throw new Error('MONGO_URL is required');
```

Bad example
```js
// Hard-coded credentials in source code.
await mongoose.connect('mongodb://user:pass@host/db');
```

## Connect
Good example: central connection module
```js
import mongoose from 'mongoose';

export async function connectMongo(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
}
```

Bad example: scattering `connect` calls
```js
// Causes multiple connections and memory leaks.
await mongoose.connect(process.env.MONGO_URL);
// ... repeated in many files
```

## Model registration guard (hot reload)
```js
export const User = mongoose.models.User || mongoose.model('User', userSchema);
```

## Define a schema and model
```js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, index: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
```

## Create
Good example
```js
const user = await User.create({ email: 'a@b.com', name: 'Ada' });
```

Bad example: skipping validation
```js
// This bypasses schema validation.
await User.collection.insertOne({ email: 123, name: null });
```

## Read
```js
const user = await User.findOne({ email: 'a@b.com' }).lean();
```

## Read with projection
Good example
```js
const user = await User.findOne({ email: 'a@b.com' }).select('email name').lean();
```

Bad example: returning sensitive fields
```js
// Might include hashed passwords or tokens if not excluded.
const user = await User.findOne({ email: 'a@b.com' }).lean();
```

## Update
Good example: use validation and optimistic concurrency
```js
const updated = await User.findOneAndUpdate(
  { email: 'a@b.com' },
  { $set: { name: 'Ada Lovelace' } },
  { new: true, runValidators: true }
);
```

Bad example: overwrite the whole document unintentionally
```js
// Overwrites fields not in the update.
await User.replaceOne({ email: 'a@b.com' }, { name: 'Ada' });
```

## Upsert
Use upserts for idempotent writes.

Good example
```js
await User.updateOne(
  { email: 'a@b.com' },
  { $setOnInsert: { email: 'a@b.com', name: 'Ada' } },
  { upsert: true }
);
```

Bad example: upsert without $setOnInsert
```js
// This can overwrite fields on existing docs.
await User.updateOne({ email: 'a@b.com' }, { name: 'Ada' }, { upsert: true });
```

## Delete
```js
await User.deleteOne({ email: 'a@b.com' });
```

## Async/await and promises
Mongoose queries are thenables, but prefer `await` for clarity.

Good example
```js
const users = await User.find({}).limit(10);
```

Bad example: mixing callbacks and promises
```js
// Hard to reason about and easy to double-execute.
User.find({}, (err, docs) => {
  if (err) return;
});
const docs = await User.find({});
```

## Promises and `exec()`
When you want explicit execution, use `.exec()` to get a real promise.

```js
const users = await User.find({ isActive: true }).exec();
```

## Error handling
Good example: catch and inspect errors
```js
try {
  await User.create({ email: 'bad', name: 'Ada' });
} catch (err) {
  // Handle ValidationError, CastError, or MongoServerError
  console.error(err.name, err.message);
}
```

## AI agent checklist
- Use `runValidators: true` for update operations that modify fields.
- Use `lean()` for read-only responses to reduce overhead.
- Avoid `collection` access unless you need raw driver behavior.
