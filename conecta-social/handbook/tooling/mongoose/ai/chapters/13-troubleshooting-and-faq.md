# 13 - Troubleshooting and FAQ

## Contents
- [Common errors](#common-errors)
- [OverwriteModelError](#overwritemodelerror)
- [CastError](#casterror)
- [ValidationError](#validationerror)
- [MongoServerError: E11000 duplicate key](#mongoservererror-e11000-duplicate-key)
- [ServerSelectionError](#serverselectionerror)
- [StrictPopulateError](#strictpopulateerror)
- [Performance issues](#performance-issues)
- [FAQ](#faq)
- [Should I use `lean()` everywhere?](#should-i-use-lean-everywhere)
- [Should I use `Mixed`?](#should-i-use-mixed)
- [How do I debug queries?](#how-do-i-debug-queries)
- [AI agent checklist](#ai-agent-checklist)


## Common errors
### OverwriteModelError
Occurs when a model is registered more than once.
- Fix: use `mongoose.models.ModelName || mongoose.model(...)` in hot reload environments.

### CastError
Occurs when a value cannot be cast to the schema type.
- Fix: validate inputs before queries and ensure ObjectId format.

### ValidationError
Occurs when schema validation fails.
- Fix: inspect `err.errors` for details.

### MongoServerError: E11000 duplicate key
Occurs when you violate a unique index.
- Fix: catch the error and map it to a user-friendly message.

Good example
```js
try {
  await User.create({ email: 'a@b.com' });
} catch (err) {
  if (err.code === 11000) {
    // handle duplicate key
  }
}
```

### ServerSelectionError
Occurs when the driver cannot connect to any server in the cluster.
- Fix: validate network access and serverSelectionTimeoutMS.

### StrictPopulateError
Occurs when attempting to populate a path not in the schema.
- Fix: enable `strictPopulate` and validate populate paths.

## Performance issues
- Check indexes for slow queries.
- Avoid large populates and large unbounded queries.

## FAQ
### Should I use `lean()` everywhere?
No. Use `lean()` for read-only paths where you do not need document methods or middleware.

### Should I use `Mixed`?
Only when the shape is truly dynamic. It disables strict validation.

### How do I debug queries?
Enable debug mode:
```js
mongoose.set('debug', true);
```

## AI agent checklist
- Look for `OverwriteModelError` in dev/hot reload.
- Use `mongoose.set('debug', true)` only in dev.
- Verify indexes on every slow query.
