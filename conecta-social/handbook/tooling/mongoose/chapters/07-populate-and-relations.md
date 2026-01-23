# 07 - Populate and Relations

## Contents
- [Basic populate](#basic-populate)
- [Populate match and options](#populate-match-and-options)
- [Virtual populate](#virtual-populate)
- [Dynamic references with refPath](#dynamic-references-with-refpath)
- [Strict populate](#strict-populate)
- [AI agent checklist](#ai-agent-checklist)


Populate replaces referenced ObjectIds with documents from other collections.

## Basic populate
```js
const post = await Post.findById(id).populate('author');
```

Good example: explicit select
```js
const post = await Post.findById(id)
  .populate({ path: 'author', select: 'email name' })
  .lean();
```

Bad example: over-populate large graphs
```js
await Post.findById(id)
  .populate('author')
  .populate('comments.user')
  .populate('comments.user.team')
  .populate('comments.user.team.org');
```

## Populate match and options
```js
const posts = await Post.find({})
  .populate({ path: 'author', match: { isActive: true }, select: 'email name' })
  .lean();
```

Bad example: assuming populate always returns a document
```js
const post = await Post.findById(id).populate('author');
post.author.email; // author can be null if not found
```

## Virtual populate
Virtual populate enables relationships without storing an array of ObjectIds.

```js
postSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'postId',
});
```

## Dynamic references with refPath
Use `refPath` when a field can reference multiple models.

```js
const schema = new mongoose.Schema({
  itemType: { type: String, enum: ['Post', 'Comment'] },
  itemId: { type: mongoose.Schema.Types.ObjectId, refPath: 'itemType' },
});
```

## Strict populate
Use `strictPopulate` to avoid populating undefined paths.

```js
mongoose.set('strictPopulate', true);
```

## AI agent checklist
- Populate only what you need, with `select`.
- Use `lean()` if you do not need document methods.
- Prefer virtual populate for one-to-many relations with large arrays.
