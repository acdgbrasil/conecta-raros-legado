# 04 - Documents and Subdocuments

## Contents
- [Documents](#documents)
- [Document methods](#document-methods)
- [Change tracking](#change-tracking)
- [markModified for Mixed](#markmodified-for-mixed)
- [Subdocuments](#subdocuments)
- [Subdocuments vs references](#subdocuments-vs-references)
- [toObject / toJSON](#toobject-tojson)
- [Lean documents](#lean-documents)
- [Dates](#dates)
- [Lodash `cloneDeep` caveat](#lodash-clonedeep-caveat)
- [Versioning and optimistic concurrency](#versioning-and-optimistic-concurrency)
- [AI agent checklist](#ai-agent-checklist)


## Documents
Documents are instances of models with change tracking and validation.

Good example: save with validation
```js
const user = new User({ email: 'a@b.com', name: 'Ada' });
await user.save();
```

Bad example: mutate plain objects expecting Mongoose behavior
```js
const doc = await User.findOne({ email: 'a@b.com' }).lean();
// doc is plain JS object; no save() or validation
```

## Document methods
Define instance methods on the schema for document behavior.

```js
userSchema.methods.isActive = function() {
  return this.status === 'active';
};
```

## Change tracking
Mongoose tracks changes to paths and only updates modified fields.

```js
user.name = 'New Name';
await user.save();
```

## markModified for Mixed
When using Mixed types, mark changes explicitly.

```js
const doc = await User.findById(id);
doc.profile = { nickname: 'ada' };
doc.markModified('profile');
await doc.save();
```

## Subdocuments
Use subdocuments for nested structures that need validation and middleware.

```js
const commentSchema = new mongoose.Schema({
  body: String,
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
  title: String,
  comments: [commentSchema],
});
```

Good example: update subdocument safely
```js
const post = await Post.findById(id);
const comment = post.comments.id(commentId);
comment.body = 'Updated';
await post.save();
```

Bad example: update subdocument array without validation
```js
// bypasses schema rules for comments
await Post.updateOne({ _id: id }, { $push: { comments: { body: 123 } } });
```

## Subdocuments vs references
Use subdocuments for small, tightly-coupled data. Use references for large or shared data.

Good example: small embedded list
```js
const schema = new mongoose.Schema({
  flags: [{ type: String }],
});
```

Bad example: huge unbounded arrays
```js
// Consider a separate collection if this grows unbounded.
const schema = new mongoose.Schema({
  events: [eventSchema],
});
```

## toObject / toJSON
Customize serialization with schema options.

```js
schema.set('toJSON', { virtuals: true });
```

## Lean documents
`lean()` returns plain objects and skips Mongoose document overhead.

Good example: lean for read-only lists
```js
const users = await User.find({ isActive: true }).lean();
```

Bad example: calling methods on lean results
```js
const user = await User.findById(id).lean();
user.save(); // not a function
```

## Dates
Dates are stored as BSON Date types.

```js
const schema = new mongoose.Schema({
  expiresAt: { type: Date, required: true },
});
```

## Lodash `cloneDeep` caveat
Do not use `cloneDeep()` on Mongoose documents; arrays are proxies and cloning breaks them.

Bad example
```js
const doc = await User.findById(id);
const copy = _.cloneDeep(doc);
await copy.save();
```

Good example: clone via `toObject()` + `init()`
```js
const doc = await User.findById(id);
const copy = new User().init(doc.toObject());
copy.name = 'Copy';
await copy.save();
```

## Versioning and optimistic concurrency
Mongoose uses an internal version key for concurrency control.

Good example: enable optimistic concurrency
```js
const schema = new mongoose.Schema({ name: String }, {
  optimisticConcurrency: true,
});
```

Bad example: manual overwrites in high-concurrency flows
```js
const doc = await User.findById(id);
doc.name = 'Ada';
await doc.save();
// Another write may have happened since the read.
```

## AI agent checklist
- Use subdocuments when you need nested validation.
- Avoid `lean()` when you need document methods.
- Use `toJSON`/`toObject` settings for API responses.
