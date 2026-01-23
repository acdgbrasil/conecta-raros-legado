# 03 - Schemas and Types

## Contents
- [Core schema types](#core-schema-types)
- [Schema options](#schema-options)
- [Timestamps](#timestamps)
- [Defaults](#defaults)
- [Arrays and maps](#arrays-and-maps)
- [Getters and setters](#getters-and-setters)
- [Virtuals](#virtuals)
- [Required and conditional required](#required-and-conditional-required)
- [Immutable fields](#immutable-fields)
- [Custom schema types](#custom-schema-types)
- [Indexes](#indexes)
- [Compound and TTL indexes](#compound-and-ttl-indexes)
- [AI agent checklist](#ai-agent-checklist)


Schemas define the shape of documents and enable validation, defaults, getters, setters, and indexes.

## Core schema types
Common types: String, Number, Date, Buffer, Boolean, Mixed, ObjectId, Array, Map, Decimal128.

Good example: explicit refs
```js
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});
```

Bad example: loose ObjectId without ref
```js
const orderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
});
```

Good example: explicit types and indexes
```js
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['new', 'paid', 'shipped'], required: true },
  meta: { type: Map, of: String },
});
```

Bad example: loose `Mixed` without constraints
```js
const orderSchema = new mongoose.Schema({
  payload: mongoose.Schema.Types.Mixed
});
```

## Schema options
- `timestamps`: automatically manage `createdAt` and `updatedAt`.
- `strict`: drop fields not in schema (recommended).
- `strictQuery`: controls filtering behavior for unknown fields.

```js
const schema = new mongoose.Schema({ name: String }, {
  strict: true,
  timestamps: true,
});
```

## Timestamps
You can rename timestamp fields or disable one side.

```js
const schema = new mongoose.Schema({ name: String }, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});
```

## Defaults
Use functions for dynamic defaults.

Good example
```js
const schema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
});
```

Bad example: static default evaluated once
```js
const schema = new mongoose.Schema({
  createdAt: { type: Date, default: new Date() },
});
```

## Arrays and maps
Use arrays for ordered lists and maps for key/value sets.

```js
const schema = new mongoose.Schema({
  tags: [{ type: String, index: true }],
  features: { type: Map, of: String },
});
```

Good example: validate array item type
```js
const schema = new mongoose.Schema({
  scores: [{ type: Number, min: 0, max: 100 }],
});
```

Bad example: Mixed arrays
```js
const schema = new mongoose.Schema({
  data: [mongoose.Schema.Types.Mixed],
});
```

## Getters and setters
Use for formatting, not for heavy logic.

```js
const schema = new mongoose.Schema({
  email: {
    type: String,
    get: (v) => v?.toLowerCase(),
    set: (v) => v?.trim(),
  }
});
```

## Virtuals
Virtuals define computed properties.

```js
schema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});
```

## Required and conditional required
Use functions for conditional required logic.

```js
const schema = new mongoose.Schema({
  type: { type: String, required: true },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    required: function() { return this.type === 'company'; },
  },
});
```

## Immutable fields
Use `immutable` for fields that should never change after creation.

```js
const schema = new mongoose.Schema({
  tenantId: { type: String, immutable: true },
});
```

## Custom schema types
Create custom types only when built-in types are insufficient.

```js
class UppercaseString extends mongoose.SchemaType {
  cast(val) {
    if (val == null) return val;
    return String(val).toUpperCase();
  }
}

mongoose.Schema.Types.UppercaseString = UppercaseString;

const schema = new mongoose.Schema({
  code: { type: UppercaseString, required: true },
});
```

## Indexes
Declare indexes on schemas for predictable performance.

```js
schema.index({ email: 1 }, { unique: true });
```

## Compound and TTL indexes
```js
schema.index({ userId: 1, createdAt: -1 });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

Bad example: TTL without Date type
```js
// TTL only works on Date fields.
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

## AI agent checklist
- Prefer explicit schema types and enums.
- Use `default: Date.now` (function), not `new Date()`.
- Declare indexes for query paths used in production.
