# 05 - Queries and Casting

## Contents
- [Query basics](#query-basics)
- [Pagination patterns](#pagination-patterns)
- [Casting](#casting)
- [Query casting and strictQuery](#query-casting-and-strictquery)
- [Custom casting](#custom-casting)
- [Query operators](#query-operators)
- [Regex queries](#regex-queries)
- [Query helpers](#query-helpers)
- [findOneAndUpdate](#findoneandupdate)
- [Aggregation](#aggregation)
- [Cursors and streaming](#cursors-and-streaming)
- [AI agent checklist](#ai-agent-checklist)


## Query basics
Mongoose queries are chainable and support filters, projection, sort, and pagination.

```js
const users = await User.find({ isActive: true })
  .select('email name')
  .sort({ createdAt: -1 })
  .limit(20)
  .lean();
```

## Pagination patterns
Use limit/skip for small datasets or cursor-based pagination for large datasets.

Good example: cursor-based pagination
```js
const page = await User.find({ _id: { $gt: lastId } })
  .sort({ _id: 1 })
  .limit(50)
  .lean();
```

Bad example: deep skip
```js
// Large skip values can be slow.
await User.find({}).skip(50000).limit(50);
```

## Casting
Mongoose casts values based on schema types.

Good example: let Mongoose cast ObjectId
```js
await User.findById('64d2f1d2b0d0a2a2a2a2a2a2');
```

Bad example: bypass casting with raw driver ops
```js
// This skips Mongoose casting and validation.
await User.collection.findOne({ _id: 'not-an-objectid' });
```

## Query casting and strictQuery
`strictQuery` controls whether unknown filter fields are allowed.

```js
mongoose.set('strictQuery', true);
```

Good example: explicit filter keys
```js
const filter = { email: input.email };
const users = await User.find(filter);
```

Bad example: unknown keys silently ignored
```js
await User.find({ emali: 'typo@example.com' });
```

## Custom casting
Use schema types to control casting behavior (see custom types in chapter 03).

Good example: cast strings to lowercase for queries
```js
const schema = new mongoose.Schema({
  email: { type: String, lowercase: true },
});
```

Bad example: rely on client to normalize values
```js
// If client forgets, queries will miss matches.
await User.find({ email: 'USER@EXAMPLE.COM' });
```

## Query operators
Use operators with care and validate input.

Good example: $in with explicit array
```js
const users = await User.find({ status: { $in: ['active', 'pending'] } });
```

Bad example: user-controlled operators
```js
// Untrusted input can inject operators.
await User.find(req.body.filter);
```

## Regex queries
Regex can be expensive; use anchors and indexes when possible.

Good example: anchored regex
```js
await User.find({ email: /^ada@/i });
```

Bad example: unbounded regex
```js
await User.find({ email: /a/i });
```

## Query helpers
Use query helpers for reusable filters.

```js
schema.query.byStatus = function(status) {
  return this.where({ status });
};

const orders = await Order.find().byStatus('paid');
```

## findOneAndUpdate
Prefer `findOneAndUpdate` with `runValidators` and `new`.

```js
const doc = await User.findOneAndUpdate(
  { email },
  { $set: { name: 'Ada' } },
  { new: true, runValidators: true }
);
```

## Aggregation
Use aggregation for data pipelines, but keep it tested and versioned.

```js
const results = await Order.aggregate([
  { $match: { status: 'paid' } },
  { $group: { _id: '$userId', total: { $sum: '$total' } } },
]);
```

## Cursors and streaming
Use cursors for large result sets.

```js
const cursor = User.find({}).cursor();
for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
  // process doc
}
```

## AI agent checklist
- Use `runValidators` on update operations.
- Avoid raw driver calls unless you know the schema implications.
- Keep aggregation pipelines in source control with tests.
