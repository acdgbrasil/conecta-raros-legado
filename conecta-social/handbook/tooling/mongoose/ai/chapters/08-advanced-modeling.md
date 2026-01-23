# 08 - Advanced Modeling

## Contents
- [Discriminators](#discriminators)
- [Embedded discriminators](#embedded-discriminators)
- [Shared schemas](#shared-schemas)
- [Advanced schema patterns](#advanced-schema-patterns)
- [Bucket pattern](#bucket-pattern)
- [GeoJSON](#geojson)
- [AI agent checklist](#ai-agent-checklist)


This chapter covers discriminators, shared schemas, advanced schema patterns, and GeoJSON.

## Discriminators
Use discriminators for schema inheritance in a single collection.

```js
const baseSchema = new mongoose.Schema({
  kind: { type: String, required: true },
  name: String,
}, { discriminatorKey: 'kind' });

const Event = mongoose.model('Event', baseSchema);
const ClickEvent = Event.discriminator('Click', new mongoose.Schema({
  url: String,
}));
```

Good example: use discriminatorKey to query type
```js
const clicks = await Event.find({ kind: 'Click' });
```

Bad example: storing unrelated schemas in one collection
```js
// If the fields do not overlap at all, consider separate collections.
```

## Embedded discriminators
Use embedded discriminators for polymorphic subdocuments.

```js
const options = { discriminatorKey: 'kind' };
const base = new mongoose.Schema({ createdAt: Date }, options);

const commentSchema = new mongoose.Schema({
  items: [base],
});

commentSchema.path('items').discriminator('Text', new mongoose.Schema({ text: String }));
commentSchema.path('items').discriminator('Image', new mongoose.Schema({ url: String }));
```

## Shared schemas
Use shared schemas for common subdocument patterns.

```js
const addressSchema = new mongoose.Schema({
  line1: String,
  city: String,
  country: String,
});

const userSchema = new mongoose.Schema({
  shipping: addressSchema,
  billing: addressSchema,
});
```

Good example: reuse a shared schema to keep validation consistent

Bad example: duplicate schema definitions across models

## Advanced schema patterns
- Use maps for dynamic keys.
- Use arrays of subdocuments for ordered nested data.
- Use `select: false` for sensitive fields.

```js
const schema = new mongoose.Schema({
  secrets: { type: String, select: false },
  tags: [{ type: String, index: true }],
});
```

## Bucket pattern
Use bucket pattern for high-volume time-series-like data.

Good example: bucketed events
```js
const eventBucketSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  day: { type: String, index: true },
  events: [{ type: String }],
});
```

Bad example: one document per event with no indexing
```js
const eventSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  type: String,
});
```

## GeoJSON
Use GeoJSON types and geospatial indexes for location queries.

```js
const placeSchema = new mongoose.Schema({
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
  },
});

placeSchema.index({ location: '2dsphere' });
```

## AI agent checklist
- Choose discriminators only when types share most fields.
- Use `select: false` for secrets and require explicit selection.
- Always index GeoJSON fields used in queries.
