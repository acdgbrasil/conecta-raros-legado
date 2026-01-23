# 18 - Data Migrations

## Data migrations

Migrations must be idempotent and runnable in batches.

### Good examples

```js
// Process in batches with a cursor
const cursor = User.find({ status: { $exists: false } }).cursor();
for await (const doc of cursor) {
  await User.updateOne({ _id: doc._id }, { $set: { status: "active" } });
}
```

```js
// Bulk write for performance
const ops = items.map(item => ({
  updateOne: {
    filter: { _id: item._id },
    update: { $set: { status: item.status } },
  },
}));
await User.bulkWrite(ops);
```

### Bad examples

```js
// Load everything in memory
const users = await User.find({ status: { $exists: false } });
for (const u of users) {
  u.status = "active";
  await u.save();
}
```

### Quick checklist

- Can the migration run twice safely?
- Batch limit and memory control?
- Logs and change counts?
