# 10 - Performance and Security

## Contents
- [Performance basics](#performance-basics)
- [Bulk operations](#bulk-operations)
- [Index management](#index-management)
- [Explain plans](#explain-plans)
- [Lean vs documents](#lean-vs-documents)
- [Field-level encryption (FLE)](#field-level-encryption-fle)
- [Injection and input safety](#injection-and-input-safety)
- [AI agent checklist](#ai-agent-checklist)


## Performance basics
- Use indexes for query paths.
- Use `lean()` for read-only responses.
- Project only needed fields.
- Avoid unbounded `populate`.

Good example: pagination with projection
```js
const page = await User.find({})
  .select('email name')
  .sort({ createdAt: -1 })
  .limit(50)
  .lean();
```

Bad example: full collection scan
```js
await User.find({});
```

## Bulk operations
Use `bulkWrite` for many writes.

Good example: bulkWrite
```js
await User.bulkWrite([
  { updateOne: { filter: { _id: id1 }, update: { $set: { name: 'A' } } } },
  { updateOne: { filter: { _id: id2 }, update: { $set: { name: 'B' } } } },
]);
```

Bad example: many sequential writes
```js
await User.updateOne({ _id: id1 }, { $set: { name: 'A' } });
await User.updateOne({ _id: id2 }, { $set: { name: 'B' } });
```

## Index management
Define indexes in schemas and build them in deployment workflows.

```js
schema.index({ email: 1 }, { unique: true });
```

## Explain plans
Use explain to validate index usage.

```js
const explain = await User.find({ email: 'a@b.com' }).explain();
```

## Lean vs documents
Use `lean()` for performance when you do not need document methods.

## Field-level encryption (FLE)
Mongoose supports client-side field-level encryption via the MongoDB driver.
Use it only if your deployment is configured for CSFLE (KMS, schema maps, key vault).

Good example: keep FLE config centralized

Bad example: ad-hoc encryption per model

## Injection and input safety
- Use schema validation and type casting.
- Avoid `$where` and untrusted raw operators.

Good example: validate filter keys
```js
const allowed = ['email', 'name'];
const filter = {};
for (const key of allowed) if (input[key]) filter[key] = input[key];
const users = await User.find(filter);
```

Bad example: trusting user input as a filter
```js
// User can inject operators like $gt, $where.
await User.find(req.body.filter);
```

## AI agent checklist
- Add indexes for every production query path.
- Prefer `lean()` and projections for large read paths.
- Treat user-provided filters as untrusted input.
