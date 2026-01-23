# Sources for 04-documents-and-subdocs

This file copies Markdown content from the repo for this chapter. For deeper info, open the original file linked under each section.

---

## docs/documents.md

Original file: [docs/documents.md](../../documents.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Documents

Mongoose [documents](api/document.html) represent a one-to-one mapping
to documents as stored in MongoDB. Each document is an instance of its
[Model](models.html).

<ul class="toc">
  <li><a href="#documents-vs-models">Documents vs Models</a></li>
  <li><a href="#retrieving">Retrieving</a></li>
  <li><a href="#updating-using-save">Updating Using <code>save()</code></a></li>
  <li><a href="#setting-nested-properties">Setting Nested Properties</a></li>
  <li><a href="#updating-using-queries">Updating Using Queries</a></li>
  <li><a href="#validating">Validating</a></li>
  <li><a href="#overwriting">Overwriting</a></li>
</ul>

## Documents vs Models {#documents-vs-models}

[Document](api/document.html#Document) and [Model](api/model.html#Model) are distinct
classes in Mongoose. The Model class is a subclass of the Document class.
When you use the [Model constructor](api/model.html#Model), you create a
new document.

```javascript
const MyModel = mongoose.model('Test', new Schema({ name: String }));
const doc = new MyModel();

doc instanceof MyModel; // true
doc instanceof mongoose.Model; // true
doc instanceof mongoose.Document; // true
```

In Mongoose, a "document" generally means an instance of a model.
You should not have to create an instance of the Document class without
going through a model.

## Retrieving {#retrieving}

When you load documents from MongoDB using model functions like [`findOne()`](api/model.html#model_Model-findOne),
you get a Mongoose document back.

```javascript
const doc = await MyModel.findOne();

doc instanceof MyModel; // true
doc instanceof mongoose.Model; // true
doc instanceof mongoose.Document; // true
```

## Updating Using `save()` {#updating-using-save}

Mongoose documents track changes. You can modify a document using vanilla
JavaScript assignments and Mongoose will convert it into [MongoDB update operators](https://www.mongodb.com/docs/manual/reference/operator/update/).

```javascript
doc.name = 'foo';

// Mongoose sends an `updateOne({ _id: doc._id }, { $set: { name: 'foo' } })`
// to MongoDB.
await doc.save();
```

The `save()` method returns a promise. If `save()` succeeds, the promise
resolves to the document that was saved.

```javascript
doc.save().then(savedDoc => {
  savedDoc === doc; // true
});
```

If the document with the corresponding `_id` is not found, Mongoose will
report a `DocumentNotFoundError`:

```javascript
const doc = await MyModel.findOne();

// Delete the document so Mongoose won't be able to save changes
await MyModel.deleteOne({ _id: doc._id });

doc.name = 'foo';
await doc.save(); // Throws DocumentNotFoundError
```

## Setting Nested Properties

Mongoose documents have a `set()` function that you can use to safely set deeply nested properties.

```javascript
const schema = new Schema({
  nested: {
    subdoc: new Schema({
      name: String
    })
  }
});
const TestModel = mongoose.model('Test', schema);

const doc = new TestModel();
doc.set('nested.subdoc.name', 'John Smith');
doc.nested.subdoc.name; // 'John Smith'
```

Mongoose documents also have a `get()` function that lets you safely read deeply nested properties. `get()` lets you avoid having to explicitly check for nullish values, similar to JavaScript's [optional chaining operator `?.`](https://masteringjs.io/tutorials/fundamentals/optional-chaining-array).

```javascript
const doc2 = new TestModel();

doc2.get('nested.subdoc.name'); // undefined
doc2.nested?.subdoc?.name; // undefined

doc2.set('nested.subdoc.name', 'Will Smith');
doc2.get('nested.subdoc.name'); // 'Will Smith'
```

You can use optional chaining `?.` and nullish coalescing `??` with Mongoose documents.
However, be careful when using [nullish coalescing assignments `??=`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_assignment) to create nested paths with Mongoose documents.

```javascript
// The following works fine
const doc3 = new TestModel();
doc3.nested.subdoc ??= {};
doc3.nested.subdoc.name = 'John Smythe';

// The following does **NOT** work.
// Do not use the following pattern with Mongoose documents.
const doc4 = new TestModel();
(doc4.nested.subdoc ??= {}).name = 'Charlie Smith';
doc.nested.subdoc; // Empty object
doc.nested.subdoc.name; // undefined.
```

## Updating Using Queries {#updating-using-queries}

The [`save()`](api/model.html#model_Model-save) function is generally the right
way to update a document with Mongoose. With `save()`, you get full
[validation](validation.html) and [middleware](middleware.html).

For cases when `save()` isn't flexible enough, Mongoose lets you create
your own [MongoDB updates](https://www.mongodb.com/docs/manual/reference/operator/update/)
with casting, [middleware](middleware.html#notes), and [limited validation](validation.html#update-validators).

```javascript
// Update all documents in the `mymodels` collection
await MyModel.updateMany({}, { $set: { name: 'foo' } });
```

*Note that `update()`, `updateMany()`, `findOneAndUpdate()`, etc. do **not**
execute `save()` middleware. If you need save middleware and full validation,
first query for the document and then `save()` it.*

## Validating {#validating}

Documents are casted and validated before they are saved. Mongoose first casts
values to the specified type and then validates them. Internally, Mongoose
calls the document's [`validate()` method](api/document.html#document_Document-validate)
before saving.

```javascript
const schema = new Schema({ name: String, age: { type: Number, min: 0 } });
const Person = mongoose.model('Person', schema);

const p = new Person({ name: 'foo', age: 'bar' });
// Cast to Number failed for value "bar" at path "age"
await p.validate();

const p2 = new Person({ name: 'foo', age: -1 });
// Path `age` (-1) is less than minimum allowed value (0).
await p2.validate();
```

Mongoose also supports limited validation on updates using the [`runValidators` option](validation.html#update-validators).
Mongoose casts parameters to query functions like `findOne()`, `updateOne()`
by default. However, Mongoose does *not* run validation on query function
parameters by default. You need to set `runValidators: true` for Mongoose
to validate.

```javascript
// Cast to number failed for value "bar" at path "age"
await Person.updateOne({}, { age: 'bar' });

// Path `age` (-1) is less than minimum allowed value (0).
await Person.updateOne({}, { age: -1 }, { runValidators: true });
```

Read the [validation](validation.html) guide for more details.

## Overwriting {#overwriting}

There are 2 different ways to overwrite a document (replacing all keys in the
document). One way is to use the
[`Document#overwrite()` function](api/document.html#document_Document-overwrite)
followed by `save()`.

```javascript
const doc = await Person.findOne({ _id });

// Sets `name` and unsets all other properties
doc.overwrite({ name: 'Jean-Luc Picard' });
await doc.save();
```

The other way is to use [`Model.replaceOne()`](api/model.html#model_Model-replaceOne).

```javascript
// Sets `name` and unsets all other properties
await Person.replaceOne({ _id }, { name: 'Jean-Luc Picard' });
```

## Next Up

Now that we've covered Documents, let's take a look at
[Subdocuments](subdocs.html).

<!-- END COPIED CONTENT -->

---

## docs/subdocs.md

Original file: [docs/subdocs.md](../../subdocs.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Subdocuments

Subdocuments are documents embedded in other documents. In Mongoose, this
means you can nest schemas in other schemas. Mongoose has two
distinct notions of subdocuments: [arrays of subdocuments](https://masteringjs.io/tutorials/mongoose/array#document-arrays) and single nested
subdocuments.

```javascript
const childSchema = new Schema({ name: 'string' });

const parentSchema = new Schema({
  // Array of subdocuments
  children: [childSchema],
  // Single nested subdocuments
  child: childSchema
});
```

Note that populated documents are **not** subdocuments in Mongoose.
Subdocument data is embedded in the top-level document.
Referenced documents are separate top-level documents.

```javascript
const childSchema = new Schema({ name: 'string' });
const Child = mongoose.model('Child', childSchema);

const parentSchema = new Schema({
  child: {
    type: mongoose.ObjectId,
    ref: 'Child'
  }
});
const Parent = mongoose.model('Parent', parentSchema);

const doc = await Parent.findOne().populate('child');
// NOT a subdocument. `doc.child` is a separate top-level document.
doc.child;
```

<ul class="toc">
  <li><a href="#what-is-a-subdocument">What is a Subdocument?</a></li>
  <li><a href="#subdocuments-versus-nested-paths">Subdocuments versus Nested Paths</a></li>
  <li><a href="#subdocument-defaults">Subdocument Defaults</a></li>
  <li><a href="#finding-a-subdocument">Finding a Subdocument</a></li>
  <li><a href="#adding-subdocs-to-arrays">Adding Subdocs to Arrays</a></li>
  <li><a href="#removing-subdocs">Removing Subdocs</a></li>
  <li><a href="#subdoc-parents">Parents of Subdocs</a></li>
  <li><a href="#altsyntaxarrays">Alternate declaration syntax for arrays</a></li>
</ul>

## What is a Subdocument?

Subdocuments are similar to normal documents. Nested schemas can have
[middleware](middleware.html), [custom validation logic](validation.html),
virtuals, and any other feature top-level schemas can use. The major
difference is that subdocuments are
not saved individually, they are saved whenever their top-level parent
document is saved.

```javascript
const Parent = mongoose.model('Parent', parentSchema);
const parent = new Parent({ children: [{ name: 'Matt' }, { name: 'Sarah' }] });
parent.children[0].name = 'Matthew';

// `parent.children[0].save()` is a no-op, it triggers middleware but
// does **not** actually save the subdocument. You need to save the parent
// doc.
await parent.save();
```

Subdocuments have `save` and `validate` [middleware](middleware.html)
just like top-level documents. Calling `save()` on the parent document triggers
the `save()` middleware for all its subdocuments, and the same for `validate()`
middleware.

```javascript
childSchema.pre('save', function(next) {
  if ('invalid' == this.name) {
    return next(new Error('#sadpanda'));
  }
  next();
});

const parent = new Parent({ children: [{ name: 'invalid' }] });
try {
  await parent.save();
} catch (err) {
  err.message; // '#sadpanda'
}
```

Subdocuments' `pre('save')` and `pre('validate')` middleware execute
**before** the top-level document's `pre('save')` but **after** the
top-level document's `pre('validate')` middleware. This is because validating
before `save()` is actually a piece of built-in middleware.

```javascript
// Below code will print out 1-4 in order
const childSchema = new mongoose.Schema({ name: 'string' });

childSchema.pre('validate', function(next) {
  console.log('2');
  next();
});

childSchema.pre('save', function(next) {
  console.log('3');
  next();
});

const parentSchema = new mongoose.Schema({
  child: childSchema
});

parentSchema.pre('validate', function(next) {
  console.log('1');
  next();
});

parentSchema.pre('save', function(next) {
  console.log('4');
  next();
});
```

## Subdocuments versus Nested Paths

In Mongoose, nested paths are subtly different from subdocuments.
For example, below are two schemas: one with `child` as a subdocument,
and one with `child` as a nested path.

```javascript
// Subdocument
const subdocumentSchema = new mongoose.Schema({
  child: new mongoose.Schema({ name: String, age: Number })
});
const Subdoc = mongoose.model('Subdoc', subdocumentSchema);

// Nested path
const nestedSchema = new mongoose.Schema({
  child: { name: String, age: Number }
});
const Nested = mongoose.model('Nested', nestedSchema);
```

These two schemas look similar, and the documents in MongoDB will
have the same structure with both schemas. But there are a few
Mongoose-specific differences:

First, instances of `Nested` never have `child === undefined`.
You can always set subproperties of `child`, even if you don't set
the `child` property. But instances of `Subdoc` can have `child === undefined`.

```javascript
const doc1 = new Subdoc({});
doc1.child === undefined; // true
doc1.child.name = 'test'; // Throws TypeError: cannot read property...

const doc2 = new Nested({});
doc2.child === undefined; // false
console.log(doc2.child); // Prints 'MongooseDocument { undefined }'
doc2.child.name = 'test'; // Works
```

## Subdocument Defaults

Subdocument paths are undefined by default, and Mongoose does
not apply subdocument defaults unless you set the subdocument
path to a non-nullish value.

```javascript
const subdocumentSchema = new mongoose.Schema({
  child: new mongoose.Schema({
    name: String,
    age: {
      type: Number,
      default: 0
    }
  })
});
const Subdoc = mongoose.model('Subdoc', subdocumentSchema);

// Note that the `age` default has no effect, because `child`
// is `undefined`.
const doc = new Subdoc();
doc.child; // undefined
```

However, if you set `doc.child` to any object, Mongoose will apply
the `age` default if necessary.

```javascript
doc.child = {};
// Mongoose applies the `age` default:
doc.child.age; // 0
```

Mongoose applies defaults recursively, which means there's a nice
workaround if you want to make sure Mongoose applies subdocument
defaults: make the subdocument path default to an empty object.

```javascript
const childSchema = new mongoose.Schema({
  name: String,
  age: {
    type: Number,
    default: 0
  }
});
const subdocumentSchema = new mongoose.Schema({
  child: {
    type: childSchema,
    default: () => ({})
  }
});
const Subdoc = mongoose.model('Subdoc', subdocumentSchema);

// Note that Mongoose sets `age` to its default value 0, because
// `child` defaults to an empty object and Mongoose applies
// defaults to that empty object.
const doc = new Subdoc();
doc.child; // { age: 0 }
```

## Finding a Subdocument

Each subdocument has an `_id` by default. Mongoose document arrays have a
special [id](api/mongoosedocumentarray.html#mongoosedocumentarray_MongooseDocumentArray-id) method
for searching a document array to find a document with a given `_id`.

```javascript
const doc = parent.children.id(_id);
```

## Adding Subdocs to Arrays

MongooseArray methods such as `push`, `unshift`, `addToSet`, and others cast arguments to their proper types transparently:

```javascript
const Parent = mongoose.model('Parent');
const parent = new Parent();

// create a comment
parent.children.push({ name: 'Liesl' });
const subdoc = parent.children[0];
console.log(subdoc); // { _id: '501d86090d371bab2c0341c5', name: 'Liesl' }
subdoc.isNew; // true

await parent.save();
console.log('Success!');
```

You can also create a subdocument without adding it to an array by using the [`create()` method](api/mongoosedocumentarray.html#mongoosedocumentarray_MongooseDocumentArray-create) of Document Arrays.

```javascript
const newdoc = parent.children.create({ name: 'Aaron' });
```

## Removing Subdocs

Each subdocument has its own [deleteOne](api/subdocument.html#Subdocument.prototype.deleteOne()) method.
For an array subdocument, this is equivalent to calling `.pull()` on the subdocument.
For a single nested subdocument, `deleteOne()` is equivalent to setting the subdocument to [`null`](https://masteringjs.io/tutorials/fundamentals/null).

```javascript
// Equivalent to `parent.children.pull(_id)`
parent.children.id(_id).deleteOne();
// Equivalent to `parent.child = null`
parent.child.deleteOne();

await parent.save();
console.log('the subdocs were removed');
```

## Parents of Subdocs {#subdoc-parents}

Sometimes, you need to get the parent of a subdoc. You can access the
parent using the `parent()` function.

```javascript
const schema = new Schema({
  docArr: [{ name: String }],
  singleNested: new Schema({ name: String })
});
const Model = mongoose.model('Test', schema);

const doc = new Model({
  docArr: [{ name: 'foo' }],
  singleNested: { name: 'bar' }
});

doc.singleNested.parent() === doc; // true
doc.docArr[0].parent() === doc; // true
```

If you have a deeply nested subdoc, you can access the top-level document
using the `ownerDocument()` function.

```javascript
const schema = new Schema({
  level1: new Schema({
    level2: new Schema({
      test: String
    })
  })
});
const Model = mongoose.model('Test', schema);

const doc = new Model({ level1: { level2: 'test' } });

doc.level1.level2.parent() === doc; // false
doc.level1.level2.parent() === doc.level1; // true
doc.level1.level2.ownerDocument() === doc; // true
```

### Alternate declaration syntax for arrays {#altsyntaxarrays}

If you create a schema with an array of objects, Mongoose will automatically convert the object to a schema for you:

```javascript
const parentSchema = new Schema({
  children: [{ name: 'string' }]
});
// Equivalent
const parentSchema = new Schema({
  children: [new Schema({ name: 'string' })]
});
```

### Next Up

Now that we've covered Subdocuments, let's take a look at
[querying](queries.html).

<!-- END COPIED CONTENT -->

---

## docs/timestamps.md

Original file: [docs/timestamps.md](../../timestamps.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Timestamps

Mongoose schemas support a `timestamps` option.
If you set `timestamps: true`, Mongoose will add two properties of type `Date` to your schema:

1. `createdAt`: a date representing when this document was created
2. `updatedAt`: a date representing when this document was last updated

Mongoose will then set `createdAt` when the document is first inserted, and update `updatedAt` whenever you update the document using `save()`, `updateOne()`, `updateMany()`, `findOneAndUpdate()`, `update()`, `replaceOne()`, or `bulkWrite()`.

```javascript
const userSchema = new Schema({ name: String }, { timestamps: true });
const User = mongoose.model('User', userSchema);

let doc = await User.create({ name: 'test' });

console.log(doc.createdAt); // 2022-02-26T16:37:48.244Z
console.log(doc.updatedAt); // 2022-02-26T16:37:48.244Z

doc.name = 'test2';
await doc.save();
console.log(doc.createdAt); // 2022-02-26T16:37:48.244Z
console.log(doc.updatedAt); // 2022-02-26T16:37:48.307Z

doc = await User.findOneAndUpdate({ _id: doc._id }, { name: 'test3' }, { new: true });
console.log(doc.createdAt); // 2022-02-26T16:37:48.244Z
console.log(doc.updatedAt); // 2022-02-26T16:37:48.366Z
```

The `createdAt` property is immutable, and Mongoose overwrites any user-specified updates to `updatedAt` by default.

```javascript
let doc = await User.create({ name: 'test' });

console.log(doc.createdAt); // 2022-02-26T17:08:13.930Z
console.log(doc.updatedAt); // 2022-02-26T17:08:13.930Z

doc.name = 'test2';
doc.createdAt = new Date(0);
doc.updatedAt = new Date(0);
await doc.save();

// Mongoose blocked changing `createdAt` and set its own `updatedAt`, ignoring
// the attempt to manually set them.
console.log(doc.createdAt); // 2022-02-26T17:08:13.930Z
console.log(doc.updatedAt); // 2022-02-26T17:08:13.991Z

// Mongoose also blocks changing `createdAt` and sets its own `updatedAt`
// on `findOneAndUpdate()`, `updateMany()`, and other query operations
// **except** `replaceOne()` and `findOneAndReplace()`.
doc = await User.findOneAndUpdate(
  { _id: doc._id },
  { name: 'test3', createdAt: new Date(0), updatedAt: new Date(0) },
  { new: true }
);
console.log(doc.createdAt); // 2022-02-26T17:08:13.930Z
console.log(doc.updatedAt); // 2022-02-26T17:08:14.008Z
```

Keep in mind that `replaceOne()` and `findOneAndReplace()` overwrite all non-`_id` properties, **including** immutable properties like `createdAt`.
Calling `replaceOne()` or `findOneAndReplace()` will update the `createdAt` timestamp as shown below.

```javascript
// `findOneAndReplace()` and `replaceOne()` without timestamps specified in `replacement`
// sets `createdAt` and `updatedAt` to current time.
doc = await User.findOneAndReplace(
  { _id: doc._id },
  { name: 'test3' },
  { new: true }
);
console.log(doc.createdAt); // 2022-02-26T17:08:14.008Z
console.log(doc.updatedAt); // 2022-02-26T17:08:14.008Z

// `findOneAndReplace()` and `replaceOne()` with timestamps specified in `replacement`
// sets `createdAt` and `updatedAt` to the values in `replacement`.
doc = await User.findOneAndReplace(
  { _id: doc._id },
  {
    name: 'test3',
    createdAt: new Date('2022-06-01'),
    updatedAt: new Date('2022-06-01')
  },
  { new: true }
);
console.log(doc.createdAt); // 2022-06-01T00:00:00.000Z
console.log(doc.updatedAt); // 2022-06-01T00:00:00.000Z
```

## Alternate Property Names

For the purposes of these docs, we'll always refer to `createdAt` and `updatedAt`.
But you can overwrite these property names as shown below.

```javascript
const userSchema = new Schema({ name: String }, {
  timestamps: {
    createdAt: 'created_at', // Use `created_at` to store the created date
    updatedAt: 'updated_at' // and `updated_at` to store the last updated date
  }
});
```

## Disabling Timestamps

`save()`, `updateOne()`, `updateMany()`, `findOneAndUpdate()`, `update()`, `replaceOne()`, and `bulkWrite()` all support a `timestamps` option.
Set `timestamps: false` to skip setting timestamps for that particular operation.

```javascript
let doc = await User.create({ name: 'test' });

console.log(doc.createdAt); // 2022-02-26T23:28:54.264Z
console.log(doc.updatedAt); // 2022-02-26T23:28:54.264Z

doc.name = 'test2';

// Setting `timestamps: false` tells Mongoose to skip updating `updatedAt` on this `save()`
await doc.save({ timestamps: false });
console.log(doc.updatedAt); // 2022-02-26T23:28:54.264Z

// Similarly, setting `timestamps: false` on a query tells Mongoose to skip updating
// `updatedAt`.
doc = await User.findOneAndUpdate({ _id: doc._id }, { name: 'test3' }, {
  new: true,
  timestamps: false
});
console.log(doc.updatedAt); // 2022-02-26T23:28:54.264Z

// Below is how you can disable timestamps on a `bulkWrite()`
await User.bulkWrite([{
  updateOne: {
    filter: { _id: doc._id },
    update: { name: 'test4' },
    timestamps: false
  }
}]);
doc = await User.findOne({ _id: doc._id });
console.log(doc.updatedAt); // 2022-02-26T23:28:54.264Z
```

You can also set the `timestamps` option to an object to configure `createdAt` and `updatedAt` separately.
For example, in the below code, Mongoose sets `createdAt` on `save()` but skips `updatedAt`.

```javascript
const doc = new User({ name: 'test' });

// Tell Mongoose to set `createdAt`, but skip `updatedAt`.
await doc.save({ timestamps: { createdAt: true, updatedAt: false } });
console.log(doc.createdAt); // 2022-02-26T23:32:12.478Z
console.log(doc.updatedAt); // undefined
```

Disabling timestamps also lets you set timestamps yourself.
For example, suppose you need to correct a document's `createdAt` or `updatedAt` property.
You can do that by setting `timestamps: false` and setting `createdAt` yourself as shown below.

```javascript
let doc = await User.create({ name: 'test' });

// To update `updatedAt`, do a `findOneAndUpdate()` with `timestamps: false` and
// `updatedAt` set to the value you want
doc = await User.findOneAndUpdate({ _id: doc._id }, { updatedAt: new Date(0) }, {
  new: true,
  timestamps: false
});
console.log(doc.updatedAt); // 1970-01-01T00:00:00.000Z

// To update `createdAt`, you also need to set `strict: false` because `createdAt`
// is immutable
doc = await User.findOneAndUpdate({ _id: doc._id }, { createdAt: new Date(0) }, {
  new: true,
  timestamps: false,
  strict: false
});
console.log(doc.createdAt); // 1970-01-01T00:00:00.000Z
```

## Timestamps on Subdocuments

Mongoose also supports setting timestamps on subdocuments.
Keep in mind that `createdAt` and `updatedAt` for subdocuments represent when the subdocument was created or updated, not the top level document.
Overwriting a subdocument will also overwrite `createdAt`.

```javascript
const roleSchema = new Schema({ value: String }, { timestamps: true });
const userSchema = new Schema({ name: String, roles: [roleSchema] });

const doc = await User.create({ name: 'test', roles: [{ value: 'admin' }] });
console.log(doc.roles[0].createdAt); // 2022-02-27T00:22:53.836Z
console.log(doc.roles[0].updatedAt); // 2022-02-27T00:22:53.836Z

// Overwriting the subdocument also overwrites `createdAt` and `updatedAt`
doc.roles[0] = { value: 'root' };
await doc.save();
console.log(doc.roles[0].createdAt); // 2022-02-27T00:22:53.902Z
console.log(doc.roles[0].updatedAt); // 2022-02-27T00:22:53.902Z

// But updating the subdocument preserves `createdAt` and updates `updatedAt`
doc.roles[0].value = 'admin';
await doc.save();
console.log(doc.roles[0].createdAt); // 2022-02-27T00:22:53.902Z
console.log(doc.roles[0].updatedAt); // 2022-02-27T00:22:53.909Z
```

## Under the Hood

For queries with timestamps, Mongoose adds 2 properties to each update query:

1. Add `updatedAt` to `$set`
2. Add `createdAt` to `$setOnInsert`

For example, if you run the below code:

```javascript
mongoose.set('debug', true);

const userSchema = new Schema({
  name: String
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

await User.findOneAndUpdate({}, { name: 'test' });
```

You'll see the below output from Mongoose debug mode:

```no-highlight
Mongoose: users.findOneAndUpdate({}, { '$setOnInsert': { createdAt: new Date("Sun, 27 Feb 2022 00:26:27 GMT") }, '$set': { updatedAt: new Date("Sun, 27 Feb 2022 00:26:27 GMT"), name: 'test' }}, {...})
```

Notice the `$setOnInsert` for `createdAt` and `$set` for `updatedAt`.
MongoDB's [`$setOnInsert` operator](https://www.mongodb.com/docs/manual/reference/operator/update/setOnInsert/) applies the update only if a new document is [upserted](https://masteringjs.io/tutorials/mongoose/upsert).
So, for example, if you want to *only* set `updatedAt` if a new document is created, you can disable the `updatedAt` timestamp and set it yourself as shown below:

```javascript
await User.findOneAndUpdate({}, { $setOnInsert: { updatedAt: new Date() } }, {
  timestamps: { createdAt: true, updatedAt: false }
});
```

## Updating Timestamps

If you need to disable Mongoose's timestamps and update a document's timestamps to a different value using `updateOne()` or `findOneAndUpdate()`, you need to do the following:

1. Set the `timestamps` option to `false` to prevent Mongoose from setting `updatedAt`.
2. Set `overwriteImmutable` to `true` to allow overwriting `createdAt`, which is an immutable property by default.

```javascript
const createdAt = new Date('2011-06-01');
// Update a document's `createdAt` to a custom value.
// Normally Mongoose would prevent doing this because `createdAt` is immutable.
await Model.updateOne({ _id: doc._id }, { createdAt }, { overwriteImmutable: true, timestamps: false });

doc = await Model.collection.findOne({ _id: doc._id });
doc.createdAt.valueOf() === createdAt.valueOf(); // true
```

<!-- END COPIED CONTENT -->
