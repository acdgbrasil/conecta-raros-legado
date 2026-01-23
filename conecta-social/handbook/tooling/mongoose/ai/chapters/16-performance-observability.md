# 16 - Performance, Indexes, and Observability

## Goal

Measure and optimize real queries with observability and correct indexes.

## Observability and debug

### Good example

```ts
import mongoose from "mongoose";

export function enableMongoDebug() {
  mongoose.set("debug", (collection, method, query, doc, options) => {
    console.log("[mongo]", collection, method, query, doc, options);
  });
}
```

### Bad example

```ts
mongoose.set("debug", true);
```

Why it is bad:

- Verbose logs without control.
- Can leak sensitive data.

### Tips

- Use `explain()` in the Mongo shell to validate indexes.
- Set default query limits.
- Use `projection` to avoid large payloads.

### Checklist

- `lean()` when possible?
- Logs masked for sensitive data?
- Indexes validated with real queries?

## Cursors and streaming

```ts
import { UserModel } from "../models/user.model";

export async function streamUsers() {
  const cursor = UserModel.find({ status: "active" })
    .lean()
    .cursor();

  for await (const doc of cursor) {
    console.log(doc.email);
  }
}
```

## Timeouts

```ts
export async function listWithTimeout() {
  return UserModel.find({})
    .maxTimeMS(200)
    .limit(50)
    .lean()
    .exec();
}
```

### Extra checklist

- `maxTimeMS` used in critical endpoints?
- Cursor used for large batches?

## Indexes and performance

### Good examples

```js
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  status: { type: String, index: true },
});
```

```js
// In production, avoid autoIndex and sync intentionally
mongoose.set("autoIndex", false);
await User.syncIndexes();
```

### Bad examples

```js
// Relying on a collection scan in a large collection
const users = await User.find({ status: "active" });
```

### Quick checklist

- Indexes exist for frequent filters?
- Indexes are created in a controlled way in prod?
- Composite index when needed?
