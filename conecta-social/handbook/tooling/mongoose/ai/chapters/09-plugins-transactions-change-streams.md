# 09 - Plugins, Transactions, Change Streams

## Contents
- [Plugins](#plugins)
- [Plugin order](#plugin-order)
- [Transactions](#transactions)
- [Transaction retries](#transaction-retries)
- [Change streams](#change-streams)
- [AI agent checklist](#ai-agent-checklist)


## Plugins
Plugins let you add behavior to schemas.

```js
function softDelete(schema) {
  schema.add({ isDeleted: { type: Boolean, default: false } });
  schema.pre('find', function() {
    this.where({ isDeleted: { $ne: true } });
  });
}

schema.plugin(softDelete);
```

Good example: keep plugins small and focused

Bad example: hidden side effects across all models
```js
// Global plugins can surprise other models if not documented.
mongoose.plugin(softDelete);
```

## Plugin order
Plugin order matters when plugins modify the same paths or hooks.

Good example: document plugin order

Bad example: rely on accidental plugin order

## Transactions
Transactions require replica sets or sharded clusters.

```js
const session = await mongoose.startSession();
try {
  await session.withTransaction(async () => {
    await Account.updateOne({ _id: from }, { $inc: { balance: -10 } }, { session });
    await Account.updateOne({ _id: to }, { $inc: { balance: 10 } }, { session });
  });
} finally {
  session.endSession();
}
```

Good example: always pass `session`

Bad example: mixing session and non-session operations
```js
// This breaks transactional guarantees.
await Account.updateOne({ _id: from }, { $inc: { balance: -10 } }, { session });
await Account.updateOne({ _id: to }, { $inc: { balance: 10 } });
```

## Transaction retries
Use `withTransaction` which includes retry logic for transient errors.

Good example: handle transient errors
```js
await session.withTransaction(async () => {
  await Order.create([{ total: 10 }], { session });
});
```

Bad example: manual retries without idempotency
```js
for (let i = 0; i < 3; i++) {
  await Order.create({ total: 10 });
}
```

## Change streams
Change streams require replica sets or sharded clusters.

```js
const changeStream = Order.watch();
changeStream.on('change', (change) => {
  console.log(change.operationType, change.documentKey);
});
```

Good example: close on shutdown
```js
process.on('SIGTERM', async () => {
  await changeStream.close();
});
```

## AI agent checklist
- Confirm your MongoDB topology supports transactions and change streams.
- Always pass `session` to every operation inside a transaction.
- Close change streams when shutting down.
