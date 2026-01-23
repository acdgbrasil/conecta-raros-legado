# 20 - Quick Reference and Checklists

## Quick reference

### Query helpers

- `select("field")` reduces payload.
- `lean()` avoids hydration.
- `limit(n)` protects pagination.
- `sort({ createdAt: -1 })` orders results.
- `populate("ref", "field")` resolves references.

### Updates

- `findOneAndUpdate(filter, update, { new: true, runValidators: true })`.
- Common operators: `$set`, `$inc`, `$push`, `$pull`, `$addToSet`.

### Schema options

- `timestamps: true` adds `createdAt` and `updatedAt`.
- `strict: "throw"` blocks extra fields.
- `toJSON: { virtuals: true }` includes virtuals.

### Indexes

- `schema.index({ field: 1 })`.
- `unique: true` creates a unique index.
- `schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })` for TTL.

### Types

- `InferSchemaType<typeof schema>` to type documents.
- `HydratedDocument<Type>` when you need methods.

### Checklist

- `lean` used when you do not need methods?
- `runValidators` in updates?
- Indexes reviewed for real queries?

## Global checklists

### Schema checklist

- Critical fields with `required`?
- `enum` for finite domains?
- `timestamps` enabled?
- `strict` intentionally defined?

### Read checklist

- `select` reduces data?
- `limit` applied?
- `lean` when you do not need document methods?

### Write checklist

- `runValidators` in updates?
- Use of `$set`, `$inc` operators?
- Duplicate control (`E11000`)?

### Security checklist

- `tenantId` in all multi-tenant queries?
- Sensitive data excluded from `toJSON`?
- Logs without sensitive data?

### Performance checklist

- Indexes based on real queries?
- `autoIndex` disabled in production?
- Avoid `populate` without field selection?
