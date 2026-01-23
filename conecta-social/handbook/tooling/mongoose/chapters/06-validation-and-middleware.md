# 06 - Validation and Middleware

## Contents
- [Validation](#validation)
- [Custom validators](#custom-validators)
- [Async validators](#async-validators)
- [Middleware (hooks)](#middleware-hooks)
- [Post middleware](#post-middleware)
- [Query middleware](#query-middleware)
- [Error handling in middleware](#error-handling-in-middleware)
- [AI agent checklist](#ai-agent-checklist)


## Validation
Mongoose runs validation on `save()` and can run on updates with `runValidators`.

```js
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, match: /@/ },
  age: { type: Number, min: 0, max: 120 },
});
```

Good example: validation on updates
```js
await User.updateOne(
  { _id },
  { $set: { age: -1 } },
  { runValidators: true }
);
```

Bad example: silent invalid writes
```js
// Without runValidators, this writes invalid data.
await User.updateOne({ _id }, { $set: { age: -1 } });
```

## Custom validators
Use custom validators for complex rules.

```js
const schema = new mongoose.Schema({
  sku: {
    type: String,
    validate: {
      validator: (v) => /^SKU-/.test(v),
      message: 'SKU must start with SKU-',
    },
  },
});
```

## Async validators
Use async validators for checks that require I/O (like uniqueness in another collection).

```js
const schema = new mongoose.Schema({
  slug: {
    type: String,
    validate: {
      validator: async function(v) {
        const exists = await mongoose.model('Post').exists({ slug: v });
        return !exists;
      },
      message: 'Slug already in use',
    },
  },
});
```

Bad example: async validator without handling race conditions
```js
// A unique index is still required to guarantee uniqueness.
```

## Middleware (hooks)
Use middleware for cross-cutting concerns.

```js
schema.pre('save', function(next) {
  if (this.isModified('email')) this.email = this.email.toLowerCase();
  next();
});
```

Good example: use async middleware with try/catch
```js
schema.pre('save', async function() {
  if (this.isNew) this.createdAt = new Date();
});
```

Bad example: async middleware without error handling
```js
schema.pre('save', async function() {
  await riskyCall();
  // If riskyCall throws and you do not handle it, the error is unstructured.
});
```

## Post middleware
Use post hooks for logging or side effects after successful operations.

```js
schema.post('save', function(doc) {
  console.log('Saved', doc._id);
});
```

## Query middleware
Query middleware runs on `find`, `update`, etc. Use it carefully to avoid hidden filters.

```js
schema.pre('find', function() {
  this.where({ isDeleted: { $ne: true } });
});
```

## Error handling in middleware
Always propagate errors to avoid hanging operations.

```js
schema.pre('save', function(next) {
  try {
    // work
    next();
  } catch (err) {
    next(err);
  }
});
```

## AI agent checklist
- Always enable `runValidators` on update paths.
- Keep middleware logic small and deterministic.
- Document any query middleware that changes default filters.
