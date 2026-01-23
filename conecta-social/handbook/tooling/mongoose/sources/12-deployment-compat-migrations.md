# Sources for 12-deployment-compat-migrations

This file copies Markdown content from the repo for this chapter. For deeper info, open the original file linked under each section.

---

## docs/migration.md

Original file: [docs/migration.md](../../migration.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Migrating from 3.x to 4.x

There are several [backwards-breaking changes](https://github.com/Automattic/mongoose/wiki/4.0-Release-Notes) to be aware of when migrating from Mongoose 3 to Mongoose 4.

## `findOneAndUpdate()` new field is now `false` by default {#findandmodify-new}

Mongoose's `findOneAndUpdate()`, `findOneAndRemove()`,
`findByIdAndUpdate()`, and `findByIdAndRemove()` functions are just
wrappers around MongoDB's
[`findAndModify` command](http://www.mongodb.com/docs/manual/reference/method/db.collection.findAndModify/).
Both the MongoDB server and the MongoDB NodeJS driver set the `new` option
to false by default, but mongoose 3 overwrote this default. In order to be
more consistent with the MongoDB server's documentation, mongoose will
use false by default. That is,
`findOneAndUpdate({}, { $set: { test: 1 } }, callback);` will return the
document as it was *before* the `$set` operation was applied.

To return the document with modifications made on the update, use the `new: true` option.

```javascript
MyModel.findOneAndUpdate({}, { $set: { test: 1 } }, { new: true }, callback);
```

## CastError and ValidationError now use `kind` instead of `type` to report error types

In Mongoose 3, CastError and ValidationError had a `type` field. For instance, user defined validation errors would have a `type` property that contained the string 'user defined'. In Mongoose 4, this property has been renamed to `kind` due to [the V8 JavaScript engine using the Error.type property internally](https://code.google.com/p/v8/issues/detail?id=2397).

## Query now has a `.then()` function {#promises}

In mongoose 3, you needed to call `.exec()` on a query chain to get a
promise back, like `MyModel.find().exec().then();`. Mongoose 4 queries are
promises, so you can do `MyModel.find().then()` instead. Be careful if
you're using functions like
[q's `Q.ninvoke()`](https://github.com/kriskowal/q#adapting-node) or
otherwise returning a mongoose query from a promise.

## More Info {#moreinfo}

Related blog posts:

* [Introducing Version 4.0 of the Mongoose NodeJS ODM](http://www.mongodb.com/blog/post/introducing-version-40-mongoose-nodejs-odm)

<!-- END COPIED CONTENT -->

---

## docs/migrating_to_5.md

Original file: [docs/migrating_to_5.md](../../migrating_to_5.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Migrating from 4.x to 5.x

Please note: we plan to discontinue Mongoose 5 support on March 1, 2024.
Please see our [version support guide](./version-support.html).

There are several [backwards-breaking changes](https://github.com/Automattic/mongoose/blob/master/History.md)
you should be aware of when migrating from Mongoose 4.x to Mongoose 5.x.

If you're still on Mongoose 3.x, please read the [Mongoose 3.x to 4.x migration guide](migration.html).

* [Version Requirements](#version-requirements)
* [Query Middleware](#query-middleware)
* [Promises and Callbacks for `mongoose.connect()`](#promises-and-callbacks)
* [Connection Logic and `useMongoClient`](#connection-logic)
* [Setter Order](#setter-order)
* [Checking if a path is populated](#id-getter)
* [Return Values for `remove()` and `deleteX()`](#return-value-for-delete)
* [Aggregation Cursors](#aggregation-cursors)
* [geoNear](#geonear)
* [Required URI encoding of connection strings](#uri-encoding)
* [Passwords which contain certain characters](#password-characters)
* [Domain sockets](#domain-sockets)
* [`toObject()` Options](#toobject-options)
* [Aggregate Parameters](#aggregate-parameters)
* [Boolean Casting](#boolean-casting)
* [Query Casting](#query-casting)
* [Post Save Hooks Get Flow Control](#post-save-flow-control)
* [The `$pushAll` Operator](#pushall)
* [Always Use Forward Key Order](#retain-key-order)
* [Run setters on queries](#run-setters-on-queries)
* [Pre-compiled Browser Bundle](#browser-bundle)
* [Save Errors](#save-errors)
* [Init hook signatures](#init-hooks)
* [`numAffected` and `save()`](#save-num-affected)
* [`remove()` and debouncing](#remove-debounce)
* [`getPromiseConstructor()`](#get-promise-constructor)
* [Passing Parameters from Pre Hooks](#pre-hook-params)
* [`required` validator for arrays](#array-required)
* [debug output defaults to stdout instead of stderr](#debug-output)
* [Overwriting filter properties](#overwrite-filter)
* [`bulkWrite()` results](#bulkwrite-results)
* [Strict SSL validation](#strict-ssl-validation)

## Version Requirements {#version-requirements}

Mongoose now requires Node.js >= 4.0.0 and MongoDB >= 3.0.0.
[MongoDB 2.6](https://www.mongodb.com/blog/post/mongodb-2-6-end-of-life) and
[Node.js < 4](https://github.com/nodejs/Release) where both EOL-ed in 2016.

## Query Middleware {#query-middleware}

Query middleware is now compiled when you call `mongoose.model()` or `db.model()`. If you add query middleware after calling `mongoose.model()`, that middleware will **not** get called.

```javascript
const schema = new Schema({ name: String });
const MyModel = mongoose.model('Test', schema);
schema.pre('find', () => { console.log('find!'); });

MyModel.find().exec(function() {
  // In mongoose 4.x, the above `.find()` will print "find!"
  // In mongoose 5.x, "find!" will **not** be printed.
  // Call `pre('find')` **before** calling `mongoose.model()` to make the middleware apply.
});
```

## Promises and Callbacks for `mongoose.connect()` {#promises-and-callbacks}

`mongoose.connect()` and `mongoose.disconnect()` now return a promise if no callback specified, or `null` otherwise. It does **not** return the mongoose singleton.

```javascript
// Worked in mongoose 4. Does **not** work in mongoose 5, `mongoose.connect()`
// now returns a promise consistently. This is to avoid the horrible things
// we've done to allow mongoose to be a thenable that resolves to itself.
mongoose.connect('mongodb://127.0.0.1:27017/test').model('Test', new Schema({}));

// Do this instead
mongoose.connect('mongodb://127.0.0.1:27017/test');
mongoose.model('Test', new Schema({}));
```

## Connection Logic and `useMongoClient` {#connection-logic}

The [`useMongoClient` option](/docs/4.x/docs/connections.html#use-mongo-client) was
removed in Mongoose 5, it is now always `true`. As a consequence, Mongoose 5
no longer supports several function signatures for `mongoose.connect()` that
worked in Mongoose 4.x if the `useMongoClient` option was off. Below are some
examples of `mongoose.connect()` calls that do **not** work in Mongoose 5.x.

* `mongoose.connect('127.0.0.1', 27017);`
* `mongoose.connect('127.0.0.1', 'mydb', 27017);`
* `mongoose.connect('mongodb://host1:27017,mongodb://host2:27017');`

In Mongoose 5.x, the first parameter to `mongoose.connect()` and `mongoose.createConnection()`, if specified, **must** be a [MongoDB connection string](https://www.mongodb.com/docs/manual/reference/connection-string/). The
connection string and options are then passed down to [the MongoDB Node.js driver's `MongoClient.connect()` function](http://mongodb.github.io/node-mongodb-native/3.0/api/MongoClient.html#.connect). Mongoose does not modify the connection string, although `mongoose.connect()` and `mongoose.createConnection()` support a [few additional options in addition to the ones the MongoDB driver supports](http://mongoosejs.com/docs/connections.html#options).

## Setter Order {#setter-order}

Setters run in reverse order in 4.x:

```javascript
const schema = new Schema({ name: String });
schema.path('name').
  set(() => console.log('This will print 2nd')).
  set(() => console.log('This will print first'));
```

In 5.x, setters run in the order they're declared.

```javascript
const schema = new Schema({ name: String });
schema.path('name').
  set(() => console.log('This will print first')).
  set(() => console.log('This will print 2nd'));
```

## Checking if a path is populated {#id-getter}

Mongoose 5.1.0 introduced an `_id` getter to ObjectIds that lets you get an ObjectId regardless of whether a path
is populated.

```javascript
const blogPostSchema = new Schema({
  title: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author'
  }
});
const BlogPost = mongoose.model('BlogPost', blogPostSchema);

await BlogPost.create({ title: 'test', author: author._id });
const blogPost = await BlogPost.findOne();

console.log(blogPost.author); // '5b207f84e8061d1d2711b421'
// New in Mongoose 5.1.0: this will print '5b207f84e8061d1d2711b421' as well
console.log(blogPost.author._id);

await blogPost.populate('author');
console.log(blogPost.author._id); // '5b207f84e8061d1d2711b421'
```

As a consequence, checking whether `blogPost.author._id` is [no longer viable as a way to check whether `author` is populated](https://github.com/Automattic/mongoose/issues/6415#issuecomment-388579185). Use `blogPost.populated('author') != null` or `blogPost.author instanceof mongoose.Types.ObjectId` to check whether `author` is populated instead.

Note that you can call `mongoose.set('objectIdGetter', false)` to change this behavior.

## Return Values for `remove()` and `deleteX()` {#return-value-for-delete}

`deleteOne()`, `deleteMany()`, and `remove()` now resolve to the result object
rather than the full [driver `WriteOpResult` object](http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html#~writeOpCallback).

```javascript
// In 4.x, this is how you got the number of documents deleted
MyModel.deleteMany().then(res => console.log(res.result.n));
// In 5.x this is how you get the number of documents deleted
MyModel.deleteMany().then(res => res.n);
```

## Aggregation Cursors {#aggregation-cursors}

The `useMongooseAggCursor` option from 4.x is now always on. This is the new syntax for aggregation cursors in mongoose 5:

```javascript
// When you call `.cursor()`, `.exec()` will now return a mongoose aggregation
// cursor.
const cursor = MyModel.aggregate([{ $match: { name: 'Val' } }]).cursor().exec();
// No need to `await` on the cursor or wait for a promise to resolve
cursor.eachAsync(doc => console.log(doc));

// Can also pass options to `cursor()`
const cursorWithOptions = MyModel.
  aggregate([{ $match: { name: 'Val' } }]).
  cursor({ batchSize: 10 }).
  exec();
```

## `geoNear` {#geonear}

`Model.geoNear()` has been removed because the [MongoDB driver no longer supports it](https://github.com/mongodb/node-mongodb-native/blob/4bac63ce7b9e9fff87c31c5a27d78bcdaca12669/etc/notes/CHANGES_3.0.0.md#geonear-command-helper)

## Required URI encoding of connection strings {#uri-encoding}

Due to changes in the MongoDB driver, connection strings must be URI encoded.

If they are not, connections may fail with an illegal character message.

## Passwords which contain certain characters {#password-characters}

See a [full list of affected characters](https://developer.mozilla.org/en-US/docs/Glossary/percent-encoding).

If your app is used by a lot of different connection strings, it's possible
that your test cases will pass, but production passwords will fail. Encode all your connection
strings to be safe.

If you want to continue to use unencoded connection strings, the easiest fix is to use
the `mongodb-uri` module to parse the connection strings, and then produce the properly encoded
versions. You can use a function like this:

```javascript
const uriFormat = require('mongodb-uri');
function encodeMongoURI(urlString) {
  if (urlString) {
    const parsed = uriFormat.parse(urlString);
    urlString = uriFormat.format(parsed);
  }
  return urlString;
}

// Your un-encoded string.
const mongodbConnectString = 'mongodb://...';
mongoose.connect(encodeMongoURI(mongodbConnectString));
```

The function above is safe to use whether the existing string is already encoded or not.

## Domain sockets {#domain-sockets}

Domain sockets must be URI encoded. For example:

```javascript
// Works in mongoose 4. Does **not** work in mongoose 5 because of more
// stringent URI parsing.
const host = '/tmp/mongodb-27017.sock';
mongoose.createConnection(`mongodb://aaron:psw@${host}/fake`);

// Do this instead
const host = encodeURIComponent('/tmp/mongodb-27017.sock');
mongoose.createConnection(`mongodb://aaron:psw@${host}/fake`);
```

## `toObject()` Options {#toobject-options}

The `options` parameter to `toObject()` and `toJSON()` merge defaults rather than overwriting them.

```javascript
// Note the `toObject` option below
const schema = new Schema({ name: String }, { toObject: { virtuals: true } });
schema.virtual('answer').get(() => 42);
const MyModel = db.model('MyModel', schema);

const doc = new MyModel({ name: 'test' });
// In mongoose 4.x this prints "undefined", because `{ minimize: false }`
// overwrites the entire schema-defined options object.
// In mongoose 5.x this prints "42", because `{ minimize: false }` gets
// merged with the schema-defined options.
console.log(doc.toJSON({ minimize: false }).answer);
```

## Aggregate Parameters {#aggregate-parameters}

`aggregate()` no longer accepts a spread, you **must** pass your aggregation pipeline as an array. The below code worked in 4.x:

```javascript
MyModel.aggregate({ $match: { isDeleted: false } }, { $skip: 10 }).exec(cb);
```

The above code does **not** work in 5.x, you **must** wrap the `$match` and `$skip` stages in an array.

```javascript
MyModel.aggregate([{ $match: { isDeleted: false } }, { $skip: 10 }]).exec(cb);
```

## Boolean Casting {#boolean-casting}

By default, mongoose 4 would coerce any value to a boolean without error.

```javascript
// Fine in mongoose 4, would save a doc with `boolField = true`
const MyModel = mongoose.model('Test', new Schema({
  boolField: Boolean
}));

MyModel.create({ boolField: 'not a boolean' });
```

Mongoose 5 only casts the following values to `true`:

* `true`
* `'true'`
* `1`
* `'1'`
* `'yes'`

And the following values to `false`:

* `false`
* `'false'`
* `0`
* `'0'`
* `'no'`

All other values will cause a `CastError`

## Query Casting {#query-casting}

Casting for `update()`, `updateOne()`, `updateMany()`, `replaceOne()`,
`remove()`, `deleteOne()`, and `deleteMany()` doesn't happen until `exec()`.
This makes it easier for hooks and custom query helpers to modify data, because
mongoose won't restructure the data you passed in until after your hooks and
query helpers have ran. It also makes it possible to set the `overwrite` option
*after* passing in an update.

```javascript
// In mongoose 4.x, this becomes `{ $set: { name: 'Baz' } }` despite the `overwrite`
// In mongoose 5.x, this overwrite is respected and the first document with
// `name = 'Bar'` will be replaced with `{ name: 'Baz' }`
User.where({ name: 'Bar' }).update({ name: 'Baz' }).setOptions({ overwrite: true });
```

## Post Save Hooks Get Flow Control {#post-save-flow-control}

Post hooks now get flow control, which means async post save hooks and child document post save hooks execute **before** your `save()` callback.

```javascript
const ChildModelSchema = new mongoose.Schema({
  text: {
    type: String
  }
});
ChildModelSchema.post('save', function(doc) {
  // In mongoose 5.x this will print **before** the `console.log()`
  // in the `save()` callback. In mongoose 4.x this was reversed.
  console.log('Child post save');
});
const ParentModelSchema = new mongoose.Schema({
  children: [ChildModelSchema]
});

const Model = mongoose.model('Parent', ParentModelSchema);
const m = new Model({ children: [{ text: 'test' }] });
m.save(function() {
  // In mongoose 5.xm this prints **after** the "Child post save" message.
  console.log('Save callback');
});
```

## The `$pushAll` Operator {#pushall}

`$pushAll` is no longer supported and no longer used internally for `save()`, since it has been [deprecated since MongoDB 2.4](https://www.mongodb.com/docs/manual/reference/operator/update/pushAll/). Use `$push` with `$each` instead.

## Always Use Forward Key Order {#retain-key-order}

The `retainKeyOrder` option was removed, mongoose will now always retain the same key position when cloning objects. If you have queries or indexes that rely on reverse key order, you will have to change them.

## Run setters on queries {#run-setters-on-queries}

Setters now run on queries by default, and the old `runSettersOnQuery` option
has been removed.

```javascript
const schema = new Schema({
  email: { type: String, lowercase: true }
});
const Model = mongoose.model('Test', schema);
Model.find({ email: 'FOO@BAR.BAZ' }); // Converted to `find({ email: 'foo@bar.baz' })`
```

## Pre-compiled Browser Bundle {#browser-bundle}

We no longer have a pre-compiled version of mongoose for the browser. If you want to use mongoose schemas in the browser, you need to build your own bundle with browserify/webpack.

## Save Errors {#save-errors}

The `saveErrorIfNotFound` option was removed, mongoose will now always error out from `save()` if the underlying document was not found

## Init hook signatures {#init-hooks}

`init` hooks are now fully synchronous and do not receive `next()` as a parameter.

`Document.prototype.init()` no longer takes a callback as a parameter. It
was always synchronous, just had a callback for legacy reasons.

## `numAffected` and `save()` {#save-num-affected}

`doc.save()` no longer passes `numAffected` as a 3rd param to its callback.

## `remove()` and debouncing {#remove-debounce}

`doc.remove()` no longer debounces

## `getPromiseConstructor()` {#get-promise-constructor}

`getPromiseConstructor()` is gone, just use `mongoose.Promise`.

## Passing Parameters from Pre Hooks {#pre-hook-params}

You cannot pass parameters to the next pre middleware in the chain using `next()` in mongoose 5.x. In mongoose 4, `next('Test')` in pre middleware would call the
next middleware with 'Test' as a parameter. Mongoose 5.x has removed support for this.

## `required` validator for arrays {#array-required}

In mongoose 5 the `required` validator only verifies if the value is an
array. That is, it will **not** fail for *empty* arrays as it would in
mongoose 4.

## debug output defaults to stdout instead of stderr {#debug-output}

In mongoose 5 the default debug function uses `console.info()` to display messages instead of `console.error()`.

## Overwriting filter properties {#overwrite-filter}

In Mongoose 4.x, overwriting a filter property that's a primitive with one that is an object would silently fail. For example, the below code would ignore the `where()` and be equivalent to `Sport.find({ name: 'baseball' })`

```javascript
Sport.find({ name: 'baseball' }).where({ name: { $ne: 'softball' } });
```

In Mongoose 5.x, the above code will correctly overwrite `'baseball'` with `{ $ne: 'softball' }`

## `bulkWrite()` results {#bulkwrite-results}

Mongoose 5.x uses version 3.x of the [MongoDB Node.js driver](http://npmjs.com/package/mongodb). MongoDB driver 3.x changed the format of
the result of [`bulkWrite()` calls](api/model.html#model_Model-bulkWrite) so there is no longer a top-level `nInserted`, `nModified`, etc. property. The new result object structure is [described here](http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#~BulkWriteOpResult).

```javascript
const Model = mongoose.model('Test', new Schema({ name: String }));

const res = await Model.bulkWrite([{ insertOne: { document: { name: 'test' } } }]);

console.log(res);
```

In Mongoose 4.x, the above will print:

```txt
BulkWriteResult {
  ok: [Getter],
  nInserted: [Getter],
  nUpserted: [Getter],
  nMatched: [Getter],
  nModified: [Getter],
  nRemoved: [Getter],
  getInsertedIds: [Function],
  getUpsertedIds: [Function],
  getUpsertedIdAt: [Function],
  getRawResponse: [Function],
  hasWriteErrors: [Function],
  getWriteErrorCount: [Function],
  getWriteErrorAt: [Function],
  getWriteErrors: [Function],
  getLastOp: [Function],
  getWriteConcernError: [Function],
  toJSON: [Function],
  toString: [Function],
  isOk: [Function],
  insertedCount: 1,
  matchedCount: 0,
  modifiedCount: 0,
  deletedCount: 0,
  upsertedCount: 0,
  upsertedIds: {},
  insertedIds: { '0': 5be9a3101638a066702a0d38 },
  n: 1 }
```

In Mongoose 5.x, the script will print:

```txt
BulkWriteResult {
  result: 
  { ok: 1,
    writeErrors: [],
    writeConcernErrors: [],
    insertedIds: [ [Object] ],
    nInserted: 1,
    nUpserted: 0,
    nMatched: 0,
    nModified: 0,
    nRemoved: 0,
    upserted: [],
    lastOp: { ts: [Object], t: 1 } },
  insertedCount: 1,
  matchedCount: 0,
  modifiedCount: 0,
  deletedCount: 0,
  upsertedCount: 0,
  upsertedIds: {},
  insertedIds: { '0': 5be9a1c87decfc6443dd9f18 },
  n: 1 }
```

## Strict SSL Validation {#strict-ssl-validation}

The most recent versions of the [MongoDB Node.js driver use strict SSL validation by default](http://mongodb.github.io/node-mongodb-native/3.5/tutorials/connect/tls/),
which may lead to errors if you're using [self-signed certificates](https://github.com/Automattic/mongoose/issues/9147).

If this is blocking you from upgrading, you can set the `tlsInsecure` option to `true`.

```javascript
mongoose.connect(uri, { tlsInsecure: false }); // Opt out of additional SSL validation
```

<!-- END COPIED CONTENT -->

---

## docs/migrating_to_6.md

Original file: [docs/migrating_to_6.md](../../migrating_to_6.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Migrating from 5.x to 6.x

<style>
  ul > li {
    padding: 4px 0px;
  }
</style>

Please note: we plan to discontinue Mongoose 5 support on March 1, 2024.
Please see our [version support guide](./version-support.html).

There are several [backwards-breaking changes](https://github.com/Automattic/mongoose/blob/master/CHANGELOG.md)
you should be aware of when migrating from Mongoose 5.x to Mongoose 6.x.

If you're still on Mongoose 4.x, please read the [Mongoose 4.x to 5.x migration guide](migrating_to_5.html) and upgrade to Mongoose 5.x first.

* [Version Requirements](#version-requirements)
* [MongoDB Driver 4.0](#mongodb-driver-40)
* [No More Deprecation Warning Options](#no-more-deprecation-warning-options)
* [The `asPromise()` Method for Connections](#the-aspromise-method-for-connections)
* [`mongoose.connect()` Returns a Promise](#mongoose-connect-returns-a-promise)
* [Duplicate Query Execution](#duplicate-query-execution)
* [`Model.exists()` Returns a lean document instead of Boolean](#model-exists-returns-a-lean-document-instead-of-boolean)
* [`strictQuery` is now equal to `strict` by default](#strictquery-is-removed-and-replaced-by-strict)
* [MongoError is now MongoServerError](#mongoerror-is-now-mongoservererror)
* [Simplified `isValidObjectId()` and separate `isObjectIdOrHexString()`](#simplified-isvalidobjectid-and-separate-isobjectidorhexstring)
* [Clone Discriminator Schemas By Default](#clone-discriminator-schemas-by-default)
* [Schema Defined Document Key Order](#schema-defined-document-key-order)
* [`sanitizeFilter` and `trusted()`](#sanitizefilter-and-trusted)
* [Removed `omitUndefined`: Mongoose now removes `undefined` keys in updates instead of setting them to `null`](#removed-omitundefined)
* [Document Parameter to Default Functions](#document-parameter-to-default-functions)
* [Arrays are Proxies](#arrays-are-proxies)
* [`typePojoToMixed`](#typepojotomixed)
* [`strictPopulate()`](#strictpopulate)
* [Subdocument `ref` Function Context](#subdocument-ref-function-context)
* [Schema Reserved Names Warning](#schema-reserved-names-warning)
* [Subdocument Paths](#subdocument-paths)
* [Creating Aggregation Cursors](#creating-aggregation-cursors)
* [`autoCreate` Defaults to `true`](#autocreate-defaults-to-true)
* [No More `context: 'query'`](#no-more-context-query)
* [Custom Validators with Populated Paths](#custom-validators-with-populated-paths)
* [Disconnected Event with Replica Sets](#disconnected-event-with-replica-sets)
* [Removed `execPopulate()`](#removed-execpopulate)
* [`create()` with Empty Array](#create-with-empty-array)
* [Removed Nested Path Merging](#removed-nested-path-merging)
* [ObjectId `valueOf()`](#objectid-valueof)
* [Immutable `createdAt`](#immutable-createdat)
* [Removed Validator `isAsync`](#removed-validator-isasync)
* [Removed `safe`](#removed-safe)
* [SchemaType `set` parameters now use `priorValue` as the second parameter instead of `self`](#schematype-set-parameters)
* [No default model for `Query.prototype.populate()`](#no-default-model-for-query-prototype-populate)
* [`toObject()` and `toJSON()` Use Nested Schema `minimize`](#toobject-and-tojson-use-nested-schema-minimize)
* [Removed `reconnectTries` and `reconnectInterval` options](#removed-reconnecttries-and-reconnectinterval-options)
* [MongoDB Driver's New URL Parser Incompatible with Some npm Packages](#mongodb-drivers-new-url-parser-incompatible-with-some-npm-packages)
* [Lodash `.isEmpty()` returns false for ObjectIds](#lodash-object-id)
* [mongoose.modelSchemas removed](#model-schemas)
* [TypeScript changes](#typescript-changes)

## Version Requirements {#version-requirements}

Mongoose now requires Node.js >= 12.0.0. Mongoose still supports MongoDB server versions back to 3.0.0.

## MongoDB Driver 4.0 {#mongodb-driver-40}

Mongoose now uses v4.x of the [MongoDB Node driver](https://www.npmjs.com/package/mongodb).
See [the MongoDB Node drivers' migration guide](https://github.com/mongodb/node-mongodb-native/blob/4.0/docs/CHANGES_4.0.0.md) for detailed info.
Below are some of the most noteworthy changes:

* MongoDB Driver 4.x is written in TypeScript and has its own TypeScript type definitions. These may conflict with `@types/mongodb`, so if you have TypeScript compiler errors please make sure you upgrade to the [latest version of `@types/mongodb`](https://www.npmjs.com/package/@types/mongodb), which is an empty stub.
* The `poolSize` option for connections has been [replaced with `minPoolSize` and `maxPoolSize`](https://github.com/mongodb/node-mongodb-native/blob/4.1/docs/CHANGES_4.0.0.md#connection-pool-options). The Mongoose 5.x `poolSize` option is equivalent to the Mongoose 6 `maxPoolSize` option. The default value of `maxPoolSize` has been increased to 100.
* The result of `updateOne()` and `updateMany()` is now different.
* The result of `deleteOne()` and `deleteMany()` no longer has an `n` property.

```javascript
const res = await TestModel.updateMany({}, { someProperty: 'someValue' });

res.matchedCount; // Number of documents that were found that match the filter. Replaces `res.n`
res.modifiedCount; // Number of documents modified. Replaces `res.nModified`
res.upsertedCount; // Number of documents upserted. Replaces `res.upserted`
```

```javascript
const res = await TestModel.deleteMany({});

// In Mongoose 6: `{ acknowledged: true, deletedCount: 2 }`
// In Mongoose 5: `{ n: 2, ok: 1, deletedCount: 2 }`
res;

res.deletedCount; // Number of documents that were deleted. Replaces `res.n`
```

## No More Deprecation Warning Options {#no-more-deprecation-warning-options}

`useNewUrlParser`, `useUnifiedTopology`, `useFindAndModify`, and `useCreateIndex` are no longer supported options. Mongoose 6 always behaves as if `useNewUrlParser`, `useUnifiedTopology`, and `useCreateIndex` are `true`, and `useFindAndModify` is `false`. Please remove these options from your code.

```javascript
// No longer necessary:
mongoose.set('useFindAndModify', false);

await mongoose.connect('mongodb://127.0.0.1:27017/test', {
  useNewUrlParser: true, // <-- no longer necessary
  useUnifiedTopology: true // <-- no longer necessary
});
```

## The `asPromise()` Method for Connections {#the-aspromise-method-for-connections}

Mongoose connections are no longer [thenable](https://masteringjs.io/tutorials/fundamentals/thenable). This means that `await mongoose.createConnection(uri)` **no longer waits for Mongoose to connect**. Use `mongoose.createConnection(uri).asPromise()` instead. See [#8810](https://github.com/Automattic/mongoose/issues/8810).

```javascript
// The below no longer works in Mongoose 6
await mongoose.createConnection(uri);

// Do this instead
await mongoose.createConnection(uri).asPromise();
```

## `mongoose.connect()` Returns a Promise {#mongoose-connect-returns-a-promise}

The `mongoose.connect()` function now always returns a promise, **not** a Mongoose instance.

## Duplicate Query Execution {#duplicate-query-execution}

Mongoose no longer allows executing the same query object twice. If you do, you'll get a `Query was already executed` error. Executing the same query instance twice is typically indicative of mixing callbacks and promises, but if you need to execute the same query twice, you can call `Query#clone()` to clone the query and re-execute it. See [gh-7398](https://github.com/Automattic/mongoose/issues/7398)

```javascript
// Results in 'Query was already executed' error, because technically this `find()` query executes twice.
await Model.find({}, function(err, result) {});

const q = Model.find();
await q;
await q.clone(); // Can `clone()` the query to allow executing the query again
```

## `Model.exists(...)` now returns a lean document instead of boolean {#model-exists-returns-a-lean-document-instead-of-boolean}

```js
// in Mongoose 5.x, `existingUser` used to be a boolean
// now `existingUser` will be either `{ _id: ObjectId(...) }` or `null`.
const existingUser = await User.exists({ name: 'John' });
if (existingUser) {
  console.log(existingUser._id);
}
```

## `strictQuery` is now equal to `strict` by default {#strictquery-is-removed-and-replaced-by-strict}

~Mongoose no longer supports a `strictQuery` option. You must now use `strict`.~
As of Mongoose 6.0.10, we brought back the `strictQuery` option. In Mongoose 6, `strictQuery` is set to `strict` by default. This means that, by default, Mongoose will filter out query filter properties that are not in the schema.

However, this behavior was a source of confusion in some cases, so in Mongoose 7, this default changes back to `false`. So if you want to retain the default behavior of Mongoose 5 as well as Mongoose 7 and later, you can also disable `strictQuery` globally to override:

```javascript
mongoose.set('strictQuery', false);
```

In a test suite, it may be useful to set `strictQuery` to `throw`, which will throw exceptions any time a query references schema that doesn't exist, which could help identify a bug in your tests or code.

Here's an example of the effect of `strictQuery`:

```javascript
const userSchema = new Schema({ name: String });
const User = mongoose.model('User', userSchema);

// By default, this is equivalent to `User.find()` because Mongoose filters out `notInSchema`
await User.find({ notInSchema: 1 });

// Set `strictQuery: false` to opt in to filtering by properties that aren't in the schema
await User.find({ notInSchema: 1 }, null, { strictQuery: false });
// equivalent:
await User.find({ notInSchema: 1 }).setOptions({ strictQuery: false });
```

You can also disable `strictQuery` globally to override:

```javascript
mongoose.set('strictQuery', false);
```

## MongoError is now MongoServerError {#mongoerror-is-now-mongoservererror}

In MongoDB Node.js Driver v4.x, 'MongoError' is now 'MongoServerError'. Please change any code that depends on the hardcoded string 'MongoError'.

## Clone Discriminator Schemas By Default {#clone-discriminator-schemas-by-default}

Mongoose now clones discriminator schemas by default. This means you need to pass `{ clone: false }` to `discriminator()` if you're using recursive embedded discriminators.

```javascript
// In Mongoose 6, these two are equivalent:
User.discriminator('author', authorSchema);
User.discriminator('author', authorSchema.clone());

// To opt out if `clone()` is causing issues, pass `clone: false`
User.discriminator('author', authorSchema, { clone: false });
```

## Simplified `isValidObjectId()` and separate `isObjectIdOrHexString()` {#simplified-isvalidobjectid-and-separate-isobjectidorhexstring}

In Mongoose 5, `mongoose.isValidObjectId()` returned `false` for values like numbers, which was inconsistent with the MongoDB driver's `ObjectId.isValid()` function.
Technically, any JavaScript number can be converted to a MongoDB ObjectId.

In Mongoose 6, `mongoose.isValidObjectId()` is just a wrapper for `mongoose.Types.ObjectId.isValid()` for consistency.

Mongoose 6.2.5 now includes a `mongoose.isObjectIdOrHexString()` function, which does a better job of capturing the more common use case for `isValidObjectId()`: is the given value an `ObjectId` instance or a 24 character hex string representing an `ObjectId`?

```javascript
// `isValidObjectId()` returns `true` for some surprising values, because these
// values are _technically_ ObjectId representations
mongoose.isValidObjectId(new mongoose.Types.ObjectId()); // true
mongoose.isValidObjectId('0123456789ab'); // true
mongoose.isValidObjectId(6); // true
mongoose.isValidObjectId(new User({ name: 'test' })); // true

// `isObjectIdOrHexString()` instead only returns `true` for ObjectIds and 24
// character hex strings.
mongoose.isObjectIdOrHexString(new mongoose.Types.ObjectId()); // true
mongoose.isObjectIdOrHexString('62261a65d66c6be0a63c051f'); // true
mongoose.isObjectIdOrHexString('0123456789ab'); // false
mongoose.isObjectIdOrHexString(6); // false
```

## Schema Defined Document Key Order {#schema-defined-document-key-order}

Mongoose now saves objects with keys in the order the keys are specified in the schema, not in the user-defined object. So whether `Object.keys(new User({ name: String, email: String }).toObject()` is `['name', 'email']` or `['email', 'name']` depends on the order `name` and `email` are defined in your schema.

```javascript
const schema = new Schema({
  profile: {
    name: {
      first: String,
      last: String
    }
  }
});
const Test = db.model('Test', schema);

const doc = new Test({
  profile: { name: { last: 'Musashi', first: 'Miyamoto' } }
});

// Note that 'first' comes before 'last', even though the argument to `new Test()` flips the key order.
// Mongoose uses the schema's key order, not the provided objects' key order.
assert.deepEqual(Object.keys(doc.toObject().profile.name), ['first', 'last']);
```

## `sanitizeFilter` and `trusted()` {#sanitizefilter-and-trusted}

Mongoose 6 introduces a new `sanitizeFilter` option to globals and queries that defends against [query selector injection attacks](https://thecodebarbarian.com/2014/09/04/defending-against-query-selector-injection-attacks.html). If you enable `sanitizeFilter`, Mongoose will wrap any object in the query filter in a `$eq`:

```javascript
// Mongoose will convert this filter into `{ username: 'val', pwd: { $eq: { $ne: null } } }`, preventing
// a query selector injection.
await Test.find({ username: 'val', pwd: { $ne: null } }).setOptions({ sanitizeFilter: true });
```

To explicitly allow a query selector, use `mongoose.trusted()`:

```javascript
// `mongoose.trusted()` allows query selectors through
await Test.find({ username: 'val', pwd: mongoose.trusted({ $ne: null }) }).setOptions({ sanitizeFilter: true });
```

## Removed `omitUndefined`: Mongoose now removes `undefined` keys in updates instead of setting them to `null` {#removed-omitundefined}

In Mongoose 5.x, setting a key to `undefined` in an update operation was equivalent to setting it to `null`.

```javascript
let res = await Test.findOneAndUpdate({}, { $set: { name: undefined } }, { new: true });

res.name; // `null` in Mongoose 5.x

// Equivalent to `findOneAndUpdate({}, {}, { new: true })` because `omitUndefined` will
// remove `name: undefined`
res = await Test.findOneAndUpdate({}, { $set: { name: undefined } }, { new: true, omitUndefined: true });
```

Mongoose 5.x supported an `omitUndefined` option to strip out `undefined` keys.
In Mongoose 6.x, the `omitUndefined` option has been removed, and Mongoose will always strip out undefined keys.

```javascript
// In Mongoose 6, equivalent to `findOneAndUpdate({}, {}, { new: true })` because Mongoose will
// remove `name: undefined`
const res = await Test.findOneAndUpdate({}, { $set: { name: undefined } }, { new: true });
```

The only workaround is to explicitly set properties to `null` in your updates:

```javascript
const res = await Test.findOneAndUpdate({}, { $set: { name: null } }, { new: true });
```

## Document Parameter to Default Functions {#document-parameter-to-default-functions}

Mongoose now passes the document as the first parameter to `default` functions, which is helpful for using [arrow functions](https://masteringjs.io/tutorials/fundamentals/arrow) with defaults.

This may affect you if you pass a function that expects different parameters to `default`, like `default: mongoose.Types.ObjectId`. See [gh-9633](https://github.com/Automattic/mongoose/issues/9633). If you're passing a default function that does **not** utilize the document, change `default: myFunction` to `default: () => myFunction()` to avoid accidentally passing parameters that potentially change the behavior.

```javascript
const schema = new Schema({
  name: String,
  age: Number,
  canVote: {
    type: Boolean,
    // Default functions now receive a `doc` parameter, helpful for arrow functions
    default: doc => doc.age >= 18
  }
});
```

## Arrays are Proxies {#arrays-are-proxies}

Mongoose arrays are now ES6 proxies. You no longer need to `markModified()` after setting an array index directly.

```javascript
const post = await BlogPost.findOne();

post.tags[0] = 'javascript';
await post.save(); // Works, no need for `markModified()`!
```

## `typePojoToMixed` {#typepojotomixed}

Schema paths declared with `type: { name: String }` become single nested subdocs in Mongoose 6, as opposed to Mixed in Mongoose 5. This removes the need for the `typePojoToMixed` option. See [gh-7181](https://github.com/Automattic/mongoose/issues/7181).

```javascript
// In Mongoose 6, the below makes `foo` into a subdocument with a `name` property.
// In Mongoose 5, the below would make `foo` a `Mixed` type, _unless_ you set `typePojoToMixed: false`.
const schema = new Schema({
  foo: { type: { name: String } }
});
```

## `strictPopulate()` {#strictpopulate}

Mongoose now throws an error if you `populate()` a path that isn't defined in your schema. This is only for cases when we can infer the local schema, like when you use `Query#populate()`, **not** when you call `Model.populate()` on a POJO. See [gh-5124](https://github.com/Automattic/mongoose/issues/5124).

## Subdocument `ref` Function Context {#subdocument-ref-function-context}

When populating a subdocument with a function `ref` or `refPath`, `this` is now the subdocument being populated, not the top-level document. See [#8469](https://github.com/Automattic/mongoose/issues/8469).

```javascript
const schema = new Schema({
  works: [{
    modelId: String,
    data: {
      type: mongoose.ObjectId,
      ref: function(doc) {
        // In Mongoose 6, `doc` is the array element, so you can access `modelId`.
        // In Mongoose 5, `doc` was the top-level document.
        return doc.modelId;
      }
    }
  }]
});
```

## Schema Reserved Names Warning {#schema-reserved-names-warning}

Using `save`, `isNew`, and other Mongoose reserved names as schema path names now triggers a warning, not an error. You can suppress the warning by setting the `suppressReservedKeysWarning` in your schema options: `new Schema({ save: String }, { suppressReservedKeysWarning: true })`. Keep in mind that this may break plugins that rely on these reserved names.

## Subdocument Paths {#subdocument-paths}

Single nested subdocs have been renamed to "subdocument paths". So `SchemaSingleNestedOptions` is now `SchemaSubdocumentOptions` and `mongoose.Schema.Types.Embedded` is now `mongoose.Schema.Types.Subdocument`. See [gh-10419](https://github.com/Automattic/mongoose/issues/10419)

## Creating Aggregation Cursors {#creating-aggregation-cursors}

`Aggregate#cursor()` now returns an AggregationCursor instance to be consistent with `Query#cursor()`. You no longer need to do `Model.aggregate(pipeline).cursor().exec()` to get an aggregation cursor, just `Model.aggregate(pipeline).cursor()`.

## `autoCreate` Defaults to `true` {#autocreate-defaults-to-true}

`autoCreate` is `true` by default **unless** readPreference is secondary or secondaryPreferred, which means Mongoose will attempt to create every model's underlying collection before creating indexes. If readPreference is secondary or secondaryPreferred, Mongoose will default to `false` for both `autoCreate` and `autoIndex` because both `createCollection()` and `createIndex()` will fail when connected to a secondary.

## No More `context: 'query'` {#no-more-context-query}

The `context` option for queries has been removed. Now Mongoose always uses `context = 'query'`.

## Custom Validators with Populated Paths {#custom-validators-with-populated-paths}

Mongoose 6 always calls validators with depopulated paths (that is, with the id rather than the document itself). In Mongoose 5, Mongoose would call validators with the populated doc if the path was populated. See [#8042](https://github.com/Automattic/mongoose/issues/8042)

## Disconnected Event with Replica Sets {#disconnected-event-with-replica-sets}

When connected to a replica set, connections now emit 'disconnected' when connection to the primary is lost. In Mongoose 5, connections only emitted 'disconnected' when losing connection to all members of the replica set.

However, Mongoose 6 does **not** buffer commands while a connection is disconnected. So you can still successfully execute commands like queries with `readPreference = 'secondary'`, even if the Mongoose connection is in the disconnected state.

## Removed `execPopulate()` {#removed-execpopulate}

`Document#populate()` now returns a promise and is now no longer chainable.

* Replace `await doc.populate('path1').populate('path2').execPopulate();` with `await doc.populate(['path1', 'path2']);`
* Replace `await doc.populate('path1', 'select1').populate('path2', 'select2').execPopulate();` with

  ```js
  await doc.populate([{path: 'path1', select: 'select1'}, {path: 'path2', select: 'select2'}]);
  ```

## `create()` with Empty Array {#create-with-empty-array}

`await Model.create([])` in v6.0 returns an empty array when provided an empty array, in v5.0 it used to return `undefined`. If any of your code is checking whether the output is `undefined` or not, you need to modify it with the assumption that `await Model.create(...)` will always return an array if provided an array.

## Removed Nested Path Merging {#removed-nested-path-merging}

`doc.set({ child: { age: 21 } })` now works the same whether `child` is a nested path or a subdocument: Mongoose will overwrite the value of `child`. In Mongoose 5, this operation would merge `child` if `child` was a nested path.

## ObjectId `valueOf()` {#objectid-valueof}

Mongoose now adds a `valueOf()` function to ObjectIds. This means you can now use `==` to compare an ObjectId against a string.

```javascript
const a = ObjectId('6143b55ac9a762738b15d4f0');

a == '6143b55ac9a762738b15d4f0'; // true
```

## Immutable `createdAt` {#immutable-createdat}

If you set `timestamps: true`, Mongoose will now make the `createdAt` property `immutable`. See [gh-10139](https://github.com/Automattic/mongoose/issues/10139)

## Removed Validator `isAsync` {#removed-validator-isasync}

`isAsync` is no longer an option for `validate`. Use an `async function` instead.

## Removed `safe` {#removed-safe}

`safe` is no longer an option for schemas, queries, or `save()`. Use `writeConcern` instead.

## SchemaType `set` parameters {#schematype-set-parameters}

Mongoose now calls setter functions with `priorValue` as the 2nd parameter, rather than `schemaType` in Mongoose 5.

```js
const userSchema = new Schema({
  name: {
    type: String,
    trimStart: true,
    set: trimStartSetter
  }
});

// in v5.x the parameters were (value, schemaType), in v6.x the parameters are (value, priorValue, schemaType).
function trimStartSetter(val, priorValue, schemaType) {
  if (schemaType.options.trimStart && typeof val === 'string') {
    return val.trimStart();
  }
  return val;
}

const User = mongoose.model('User', userSchema);

const user = new User({ name: 'Robert Martin' });
console.log(user.name); // 'robert martin'
```

## `toObject()` and `toJSON()` Use Nested Schema `minimize` {#toobject-and-tojson-use-nested-schema-minimize}

This change was technically released with 5.10.5, but [caused issues for users migrating from 5.9.x to 6.x](https://github.com/Automattic/mongoose/issues/10827).
In Mongoose `< 5.10.5`, `toObject()` and `toJSON()` would use the top-level schema's `minimize` option by default.

```javascript
const child = new Schema({ thing: Schema.Types.Mixed });
const parent = new Schema({ child }, { minimize: false });
const Parent = model('Parent', parent);
const p = new Parent({ child: { thing: {} } });

// In v5.10.4, would contain `child.thing` because `toObject()` uses `parent` schema's `minimize` option
// In `>= 5.10.5`, `child.thing` is omitted because `child` schema has `minimize: true`
console.log(p.toObject());
```

As a workaround, you can either explicitly pass `minimize` to `toObject()` or `toJSON()`:

```javascript
console.log(p.toObject({ minimize: false }));
```

Or define the `child` schema inline (Mongoose 6 only) to inherit the parent's `minimize` option.

```javascript
const parent = new Schema({
  // Implicitly creates a new schema with the top-level schema's `minimize` option.
  child: { type: { thing: Schema.Types.Mixed } }
}, { minimize: false });
```

## No default model for `Query.prototype.populate()` {#no-default-model-for-query-prototype-populate}

In Mongoose 5, calling `populate()` on a mixed type or other path with no `ref` would fall back to using the query's model.

```javascript
const testSchema = new mongoose.Schema({
  data: String,
  parents: Array // Array of mixed
});

const Test = mongoose.model('Test', testSchema);

// The below `populate()`...
await Test.findOne().populate('parents');
// Is a shorthand for the following populate in Mongoose 5
await Test.findOne().populate({ path: 'parents', model: Test });
```

In Mongoose 6, populating a path with no `ref`, `refPath`, or `model` is a no-op.

```javascript
// The below `populate()` does nothing.
await Test.findOne().populate('parents');
```

## MongoDB Driver's New URL Parser Incompatible with Some npm Packages {#mongodb-drivers-new-url-parser-incompatible-with-some-npm-packages}

The MongoDB Node driver version that Mongoose 6 uses relies on a [URL parser module](https://npmjs.com/package/whatwg-url) that has several known compatibility issues with other npm packages.
This can lead to errors like `Invalid URL: mongodb+srv://username:password@development.xyz.mongodb.net/abc` if you use one of the incompatible packages.
[You can find a list of incompatible packages here](https://mongoosejs.com/docs/incompatible_packages).

## Removed `reconnectTries` and `reconnectInterval` options {#removed-reconnecttries-and-reconnectinterval-options}

The `reconnectTries` and `reconnectInterval` options have been removed since they are no longer necessary.

The MongoDB node driver will always attempt to retry any operation for up to `serverSelectionTimeoutMS`, even if MongoDB is down for a long period of time.
So, it will never run out of retries or try to reconnect to MongoDB.

## Lodash `.isEmpty()` returns true for ObjectIds {#lodash-object-id}

Lodash's `isEmpty()` function returns true for primitives and primitive wrappers.
`ObjectId()` is an object wrapper that is treated as a primitive by Mongoose.
But starting in Mongoose 6, `_.isEmpty()` will return true for ObjectIds because of Lodash implementation details.

An ObjectId in mongoose is never empty, so if you're using `isEmpty()` you should check for `instanceof ObjectId`.

```javascript
if (!(val instanceof Types.ObjectId) && _.isEmpty(val)) {
  // Handle empty object here
}
```

## Removed `mongoose.modelSchemas` {#model-schemas}

The `mongoose.modelSchemas` property was removed. This may have been used to delete a model schema.

```javascript
// before
delete mongoose.modelSchemas.User;

// with Mongoose 6.x
delete mongoose.deleteModel('User');
```

## TypeScript changes

The `Schema` class now takes 3 generic params instead of 4. The 3rd generic param, `SchemaDefinitionType`, is now the same as the 1st generic param `DocType`. Replace `new Schema<UserDocument, UserModel, User>(schemaDefinition)` with `new Schema<UserDocument, UserModel>(schemaDefinition)`

`Types.ObjectId` is now a class, which means you can no longer omit `new` when creating a new ObjectId using `new mongoose.Types.ObjectId()`.
Currently, you can still omit `new` in JavaScript, but you **must** put `new` in TypeScript.

The following legacy types have been removed:

* `ModelUpdateOptions`
* `DocumentQuery`
* `HookSyncCallback`
* `HookAsyncCallback`
* `HookErrorCallback`
* `HookNextFunction`
* `HookDoneFunction`
* `SchemaTypeOpts`
* `ConnectionOptions`

Mongoose 6 infers the document's type for `this` in virtual getters and setters.
In Mongoose 5.x, `this` would be `any` in the following code.

```ts
schema.virtual('myVirtual').get(function() {
  this; // any in Mongoose 5.x
});
```

In Mongoose 6, `this` will be set to the document type.

```ts
const schema = new Schema({ name: String });

schema.virtual('myVirtual').get(function() {
  this.name; // string
});
```

<!-- END COPIED CONTENT -->

---

## docs/migrating_to_7.md

Original file: [docs/migrating_to_7.md](../../migrating_to_7.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Migrating from 6.x to 7.x

<style>
  ul > li {
    padding: 4px 0px;
  }
</style>

There are several backwards-breaking changes
you should be aware of when migrating from Mongoose 6.x to Mongoose 7.x.

If you're still on Mongoose 5.x, please read the [Mongoose 5.x to 6.x migration guide](migrating_to_6.html) and upgrade to Mongoose 6.x first.

* [Version Requirements](#version-requirements)
* [`strictQuery`](#strictquery)
* [Removed `remove()`](#removed-remove)
* [Dropped callback support](#dropped-callback-support)
* [Removed `update()`](#removed-update)
* [ObjectId requires `new`](#objectid-requires-new)
* [`id` setter](#id-setter)
* [Discriminator schemas use base schema options by default](#discriminator-schemas-use-base-schema-options-by-default)
* [Removed `castForQueryWrapper()`, updated `castForQuery()` signature](#removed-castforquerywrapper)
* [Copy schema options in `Schema.prototype.add()`](#copy-schema-options-in-schema-prototype-add)
* [ObjectId bsontype now has lowercase d](#objectid-bsontype-now-has-lowercase-d)
* [Removed support for custom promise libraries](#removed-support-for-custom-promise-libraries)
* [Removed mapReduce](#removed-mapreduce)
* [Deprecated `keepAlive`](#deprecated-keepalive)
* [TypeScript-specific changes](#typescript-specific-changes)
  * [Removed `LeanDocument` and support for `extends Document`](#removed-leandocument-and-support-for-extends-document)
  * [New parameters for `HydratedDocument`](#new-parameters-for-hydrateddocument)

## Version Requirements {#version-requirements}

Mongoose now requires Node.js >= 14.0.0 and MongoDB Node Driver >= 5.0.0.

See [the MongoDB Node Driver migration guide](https://github.com/mongodb/node-mongodb-native/blob/main/etc/notes/CHANGES_5.0.0.md) for detailed info.

## `strictQuery` {#strictquery}

`strictQuery` is now false by default.

```javascript
const mySchema = new Schema({ field: Number });
const MyModel = mongoose.model('Test', mySchema);

// Mongoose will not strip out `notInSchema: 1` because `strictQuery` is false by default
const docs = await MyModel.find({ notInSchema: 1 });
// Empty array in Mongoose 7. In Mongoose 6, this would contain all documents in MyModel
docs;
```

## Removed `remove()` {#removed-remove}

The `remove()` method on documents and models has been removed.
Use `deleteOne()` or `deleteMany()` instead.

```javascript
const mySchema = new Schema({ field: Number });
const MyModel = mongoose.model('Test', mySchema);

// Change this:
await MyModel.remove(filter);

// To this:
await MyModel.deleteOne(filter);
// Or this, if you want to delete multiple:
await MyModel.deleteMany(filter);

// For documents, change this:
await doc.remove();

// To this:
await doc.deleteOne();
```

Keep in mind that `deleteOne()` hooks are treated as query middleware by default.
So for middleware, please do the following:

```javascript
// Replace this:
schema.pre('remove', function() {
  /* ... */
});

// With this:
schema.pre('deleteOne', { document: true, query: false }, function() {
  /* ... */
});
```

## Dropped callback support {#dropped-callback-support}

The following functions no longer accept callbacks.
They always return promises.

* `Aggregate.prototype.exec`
* `Aggregate.prototype.explain`
* `AggregationCursor.prototype.close`
* `AggregationCursor.prototype.next`
* `AggregationCursor.prototype.eachAsync`
* `Connection.prototype.startSession`
* `Connection.prototype.dropCollection`
* `Connection.prototype.createCollection`
* `Connection.prototype.dropDatabase`
* `Connection.prototype.openUri`
* `Connection.prototype.close`
* `Connection.prototype.destroy`
* `Document.prototype.populate`
* `Document.prototype.save`
* `Document.prototype.validate`
* `Mongoose.prototype.connect`
* `Mongoose.prototype.createConnection`
* `Model.prototype.save`
* `Model.aggregate`
* `Model.bulkWrite`
* `Model.cleanIndexes`
* `Model.count`
* `Model.countDocuments`
* `Model.create`
* `Model.createCollection`
* `Model.createIndexes`
* `Model.deleteOne`
* `Model.deleteMany`
* `Model.distinct`
* `Model.ensureIndexes`
* `Model.estimatedDocumentCount`
* `Model.exists`
* `Model.find`
* `Model.findById`
* `Model.findByIdAndUpdate`
* `Model.findByIdAndReplace`
* `Model.findOne`
* `Model.findOneAndDelete`
* `Model.findOneAndUpdate`
* `Model.findOneAndRemove`
* `Model.insertMany`
* `Model.listIndexes`
* `Model.replaceOne`
* `Model.syncIndexes`
* `Model.updateMany`
* `Model.updateOne`
* `Query.prototype.count`
* `Query.prototype.find`
* `Query.prototype.findOne`
* `Query.prototype.findOneAndDelete`
* `Query.prototype.findOneAndUpdate`
* `Query.prototype.findOneAndRemove`
* `Query.prototype.findOneAndReplace`
* `Query.prototype.validate`
* `Query.prototype.deleteOne`
* `Query.prototype.deleteMany`
* `Query.prototype.exec`
* `QueryCursor.prototype.close`
* `QueryCursor.prototype.next`
* `QueryCursor.prototype.eachAsync`

If you are using the above functions with callbacks, we recommend switching to async/await, or promises if async functions don't work for you.
If you need help refactoring a legacy codebase, [this tool from Mastering JS callbacks to async await](https://masteringjs.io/tutorials/tools/callback-to-async-await) using ChatGPT.

```javascript
// Before
conn.startSession(function(err, session) {
  // ...
});

// After
const session = await conn.startSession();
// Or:
conn.startSession().then(session => { /* ... */ });

// With error handling
try {
  await conn.startSession();
} catch (err) { /* ... */ }
// Or:
const [err, session] = await conn.startSession().then(
  session => ([null, session]),
  err => ([err, null])
);
```

## Removed `update()` {#removed-update}

`Model.update()`, `Query.prototype.update()`, and `Document.prototype.update()` have been removed.
Use `updateOne()` instead.

```javascript
// Before
await Model.update(filter, update);
await doc.update(update);

// After
await Model.updateOne(filter, update);
await doc.updateOne(update);
```

## ObjectId requires `new` {#objectid-requires-new}

In Mongoose 6 and older, you could define a new ObjectId without using the `new` keyword:

```javascript
// Works in Mongoose 6
// Throws "Class constructor ObjectId cannot be invoked without 'new'" in Mongoose 7
const oid = mongoose.Types.ObjectId('0'.repeat(24));
```

In Mongoose 7, `ObjectId` is now a [JavaScript class](https://masteringjs.io/tutorials/fundamentals/class), so you need to use the `new` keyword.

```javascript
// Works in Mongoose 6 and Mongoose 7
const oid = new mongoose.Types.ObjectId('0'.repeat(24));
```

## `id` Setter {#id-setter}

Starting in Mongoose 7.4, Mongoose's built-in `id` virtual (which stores the document's `_id` as a string) has a setter which allows modifying the document's `_id` property via `id`.

```javascript
const doc = await TestModel.findOne();

doc.id = '000000000000000000000000';
doc._id; // ObjectId('000000000000000000000000')
```

This can cause surprising behavior if you create a `new TestModel(obj)` where `obj` contains both an `id` and an `_id`, or if you use `doc.set()`

```javascript
// Because `id` is after `_id`, the `id` will overwrite the `_id`
const doc = new TestModel({
  _id: '000000000000000000000000',
  id: '111111111111111111111111'
});

doc._id; // ObjectId('111111111111111111111111')
```

[The `id` setter was later removed in Mongoose 8](/docs/migrating_to_8.html#removed-id-setter) due to compatibility issues.

## Discriminator schemas use base schema options by default {#discriminator-schemas-use-base-schema-options-by-default}

When you use `Model.discriminator()`, Mongoose will now use the discriminator base schema's options by default.
This means you don't need to explicitly set child schema options to match the base schema's.

```javascript
const baseSchema = Schema({}, { typeKey: '$type' });
const Base = db.model('Base', baseSchema);

// In Mongoose 6.x, the `Base.discriminator()` call would throw because
// no `typeKey` option. In Mongoose 7, Mongoose uses the base schema's
// `typeKey` by default.
const childSchema = new Schema({}, {});
const Test = Base.discriminator('Child', childSchema);

Test.schema.options.typeKey; // '$type'
```

## Removed `castForQueryWrapper`, updated `castForQuery()` signature {#removed-castforquerywrapper}

Mongoose now always calls SchemaType `castForQuery()` method with 3 arguments: `$conditional`, `value`, and `context`.
If you've implemented a custom schema type that defines its own `castForQuery()` method, you need to update the method as follows.

```javascript
// Mongoose 6.x format:
MySchemaType.prototype.castForQuery = function($conditional, value) {
  if (arguments.length === 2) {
    // Handle casting value with `$conditional` - $eq, $in, $not, etc.
  } else {
    value = $conditional;
    // Handle casting `value` with no conditional
  }
};

// Mongoose 7.x format
MySchemaType.prototype.castForQuery = function($conditional, value, context) {
  if ($conditional != null) {
    // Handle casting value with `$conditional` - $eq, $in, $not, etc.
  } else {
    // Handle casting `value` with no conditional
  }
};
```

## Copy Schema options in `Schema.prototype.add()` {#copy-schema-options-in-schema-prototype-add}

Mongoose now copies user defined schema options when adding one schema to another.
For example, `childSchema` below will get `baseSchema`'s `id` and `toJSON` options.

```javascript
const baseSchema = new Schema({ created: Date }, { id: true, toJSON: { virtuals: true } });
const childSchema = new Schema([baseSchema, { name: String }]);

childSchema.options.toJSON; // { virtuals: true } in Mongoose 7. undefined in Mongoose 6.
```

This applies both when creating a new schema using an array of schemas, as well as when calling `add()` as follows.

```javascript
childSchema.add(new Schema({}, { toObject: { virtuals: true } }));

childSchema.options.toObject; // { virtuals: true } in Mongoose 7. undefined in Mongoose 6.
```

## ObjectId bsontype now has lowercase d {#objectid-bsontype-now-has-lowercase-d}

The internal `_bsontype` property on ObjectIds is equal to `'ObjectId'` in Mongoose 7, as opposed to `'ObjectID'` in Mongoose 6.

```javascript
const oid = new mongoose.Types.ObjectId();

oid._bsontype; // 'ObjectId' in Mongoose 7, 'ObjectID' in older versions of Mongoose
```

Please update any places where you use `_bsontype` to check if an object is an ObjectId.
This may also affect libraries that use Mongoose.

## Removed `mapReduce` {#removed-mapreduce}

MongoDB no longer supports `mapReduce`, so Mongoose 7 no longer has a `Model.mapReduce()` function.
Use the aggregation framework as a replacement for `mapReduce()`.

```javascript
// The following no longer works in Mongoose 7.
const o = {
  map: function() {
    emit(this.author, 1);
  },
  reduce: function(k, vals) {
    return vals.length;
  }
};

await MR.mapReduce(o);
```

## Removed Support for custom promise libraries {#removed-support-for-custom-promise-libraries}

Mongoose 7 no longer supports plugging in custom promise libraries. So the following no longer makes Mongoose return Bluebird promises in Mongoose 7.

```javascript
const mongoose = require('mongoose');

// No-op on Mongoose 7
mongoose.Promise = require('bluebird');
```

If you want to use Bluebird for all promises globally, you can do the following:

```javascript
global.Promise = require('bluebird');
```

## Deprecated `keepAlive` {#deprecated-keepalive}

Before Mongoose 5.2.0, you needed to enable the `keepAlive` option to initiate [TCP keepalive](https://tldp.org/HOWTO/TCP-Keepalive-HOWTO/overview.html) to prevent `"connection closed"` errors.
However, `keepAlive` has been `true` by default since Mongoose 5.2.0, and the `keepAlive` is deprecated as of Mongoose 7.2.0.
Please remove `keepAlive` and `keepAliveInitialDelay` options from your Mongoose connections.

## TypeScript-specific Changes {#typescript-specific-changes}

### Removed `LeanDocument` and support for `extends Document` {#removed-leandocument-and-support-for-extends-document}

Mongoose 7 no longer exports a `LeanDocument` type, and no longer supports passing a document type that `extends Document` into `Model<>`.

```ts
// No longer supported
interface ITest extends Document {
  name?: string;
}
const Test = model<ITest>('Test', schema);

// Do this instead, no `extends Document`
interface ITest {
  name?: string;
}
const Test = model<ITest>('Test', schema);

// If you need to access the hydrated document type, use the following code
type TestDocument = ReturnType<(typeof Test)['hydrate']>;
```

### New Parameters for `HydratedDocument` {#new-parameters-for-hydrateddocument}

Mongoose's `HydratedDocument` type transforms a raw document interface into the type of the hydrated Mongoose document, including virtuals, methods, etc.
In Mongoose 7, the generic parameters to `HydratedDocument` have changed.
In Mongoose 6, the generic parameters were:

```ts
type HydratedDocument<
  DocType,
  TMethodsAndOverrides = {},
  TVirtuals = {}
> = Document<unknown, any, DocType> &
Require_id<DocType> &
TMethodsAndOverrides &
TVirtuals;
```

In Mongoose 7, the new type is as follows.

```ts
type HydratedDocument<
  DocType,
  TOverrides = {},
  TQueryHelpers = {}
> = Document<unknown, TQueryHelpers, DocType> &
Require_id<DocType> &
TOverrides;
```

In Mongoose 7, the first parameter is the raw document interface, the 2nd parameter is any document-specific overrides (usually virtuals and methods), and the 3rd parameter is any query helpers associated with the document's model.

The key difference is that, in Mongoose 6, the 3rd generic param was the document's *virtuals*.
In Mongoose 7, the 3rd generic param is the document's *query helpers*.

```ts
// Mongoose 6 version:
type UserDocument = HydratedDocument<TUser, TUserMethods, TUserVirtuals>;

// Mongoose 7:
type UserDocument = HydratedDocument<TUser, TUserMethods & TUserVirtuals, TUserQueryHelpers>;
```

<!-- END COPIED CONTENT -->

---

## docs/migrating_to_8.md

Original file: [docs/migrating_to_8.md](../../migrating_to_8.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Migrating from 7.x to 8.x

<style>
  ul > li {
    padding: 4px 0px;
  }
</style>

There are several backwards-breaking changes you should be aware of when migrating from Mongoose 7.x to Mongoose 8.x.

If you're still on Mongoose 6.x or earlier, please read the [Mongoose 6.x to 7.x migration guide](migrating_to_7.html) and upgrade to Mongoose 7.x first before upgrading to Mongoose 8.

We also recommend reviewing the [MongoDB Node.js driver's release notes for v6.0.0](https://github.com/mongodb/node-mongodb-native/releases/tag/v6.0.0) before upgrading to Mongoose 8.

* [Removed `rawResult` option for `findOneAndUpdate()`](#removed-rawresult-option-for-findoneandupdate)
* [`Document.prototype.deleteOne()` now returns a query](#document-prototype-deleteone-now-returns-a-query)
* [MongoDB Node Driver 6.0](#mongodb-node-driver-6)
* [Removed `findOneAndRemove()`](#removed-findoneandremove)
* [Removed `count()`](#removed-count)
* [Removed id Setter](#removed-id-setter)
* [`null` is valid for non-required string enums](#null-is-valid-for-non-required-string-enums)
* [Apply minimize when `save()` updates an existing document](#apply-minimize-when-save-updates-an-existing-document)
* [Apply base schema paths before discriminator paths](#apply-base-schema-paths-before-discriminator-paths)
* [Removed `overwrite` option for `findOneAndUpdate()`](#removed-overwrite-option-for-findoneandupdate)
* [Changed behavior for `findOneAndUpdate()` with `orFail()` and upsert](#changed-behavior-for-findoneandupdate-with-orfail-and-upsert)
* [`create()` waits until all saves are done before throwing any error](#create-waits-until-all-saves-are-done-before-throwing-any-error)
* [`Model.validate()` returns copy of object](#model-validate-returns-copy-of-object)
* [Allow `null` For Optional Fields in TypeScript](#allow-null-for-optional-fields-in-typescript)
* [Model constructor properties are all optional in TypeScript](#model-constructor-properties-are-all-optional-in-typescript)
* [Infer `distinct()` return types from schema](#infer-distinct-return-types-from-schema)

## Removed `rawResult` option for `findOneAndUpdate()` {#removed-rawresult-option-for-findoneandupdate}

The `rawResult` option for `findOneAndUpdate()`, `findOneAndReplace()`, and `findOneAndDelete()` has been replaced by the `includeResultMetadata` option.

```javascript
const filter = { name: 'Will Riker' };
const update = { age: 29 };

const res = await Character.findOneAndUpdate(filter, update, {
  new: true,
  upsert: true,
  // Replace `rawResult: true` with `includeResultMetadata: true`
  includeResultMetadata: true
});
```

`includeResultMetadata` in Mongoose 8 behaves identically to `rawResult`.

## `Document.prototype.deleteOne` now returns a query {#document-prototype-deleteone-now-returns-a-query}

In Mongoose 7, `doc.deleteOne()` returned a promise that resolved to `doc`.
In Mongoose 8, `doc.deleteOne()` returns a query for easier chaining, as well as consistency with `doc.updateOne()`.

```javascript
const numberOne = await Character.findOne({ name: 'Will Riker' });

// In Mongoose 7, q is a Promise that resolves to `numberOne`
// In Mongoose 8, q is a Query.
const q = numberOne.deleteOne();

// In Mongoose 7, `res === numberOne`
// In Mongoose 8, `res` is a `DeleteResult`.
const res = await q;
```

## MongoDB Node Driver 6 {#mongodb-node-driver-6}

Mongoose 8 uses [v6.x of the MongoDB Node driver](https://github.com/mongodb/node-mongodb-native/releases/tag/v6.0.0).
There's a few noteable changes in MongoDB Node driver v6 that affect Mongoose:

1. The `ObjectId` constructor no longer accepts strings of length 12. In Mongoose 7, `new mongoose.Types.ObjectId('12charstring')` was perfectly valid. In Mongoose 8, `new mongoose.Types.ObjectId('12charstring')` throws an error.

1. Deprecated SSL options have been removed

   * `sslCA` -> `tlsCAFile`
   * `sslCRL` -> `tlsCRLFile`
   * `sslCert` -> `tlsCertificateKeyFile`
   * `sslKey` -> `tlsCertificateKeyFile`
   * `sslPass` -> `tlsCertificateKeyFilePassword`
   * `sslValidate` -> `tlsAllowInvalidCertificates`
   * `tlsCertificateFile` -> `tlsCertificateKeyFile`

## Removed `findOneAndRemove()` {#removed-findoneandremove}

In Mongoose 7, `findOneAndRemove()` was an alias for `findOneAndDelete()` that Mongoose supported for backwards compatibility.
Mongoose 8 no longer supports `findOneAndRemove()`.
Use `findOneAndDelete()` instead.

Similarly, Mongoose 8 no longer supports `findByIdAndRemove()`, which was an alias for `findByIdAndDelete()`.
Please use `findByIdAndDelete()` instead.

## Removed `count()` {#removed-count}

`Model.count()` and `Query.prototype.count()` were removed in Mongoose 8. Use `Model.countDocuments()` and `Query.prototype.countDocuments()` instead.

## Removed id Setter {#removed-id-setter}

In Mongoose 7.4, Mongoose introduced an `id` setter that made `doc.id = '0'.repeat(24)` equivalent to `doc._id = '0'.repeat(24)`.
In Mongoose 8, that setter is now removed.

## `null` is valid for non-required string enums {#null-is-valid-for-non-required-string-enums}

Before Mongoose 8, setting a string path with an `enum` to `null` would lead to a validation error, even if that path wasn't `required`.
In Mongoose 8, it is valid to set a string path to `null` if `required` is not set, even with `enum`.

```javascript
const schema = new Schema({
  status: {
    type: String,
    enum: ['on', 'off']
  }
});
const Test = mongoose.model('Test', schema);

// Works fine in Mongoose 8
// Throws a `ValidationError` in Mongoose 7
await Test.create({ status: null });
```

## Apply minimize when `save()` updates an existing document {#apply-minimize-when-save-updates-an-existing-document}

In Mongoose 7, Mongoose would only apply minimize when saving a new document, not when updating an existing document.

```javascript
const schema = new Schema({
  nested: {
    field1: Number
  }
});
const Test = mongoose.model('Test', schema);

// Both Mongoose 7 and Mongoose 8 strip out empty objects when saving
// a new document in MongoDB by default
const { _id } = await Test.create({ nested: {} });
let rawDoc = await Test.findById(_id).lean();
rawDoc.nested; // undefined

// Mongoose 8 will also strip out empty objects when saving an
// existing document in MongoDB
const doc = await Test.findById(_id);
doc.nested = {};
doc.markModified('nested');
await doc.save();

let rawDoc = await Test.findById(_id).lean();
rawDoc.nested; // undefined in Mongoose 8, {} in Mongoose 7
```

## Apply base schema paths before discriminator paths {#apply-base-schema-paths-before-discriminator-paths}

This means that, in Mongoose 8, getters and setters on discriminator paths run *after* getters and setters on base paths.
In Mongoose 7, getters and setters on discriminator paths ran *before* getters and setters on base paths.

```javascript

const schema = new Schema({
  name: {
    type: String,
    get(v) {
      console.log('Base schema getter');
      return v;
    }
  }
});

const Test = mongoose.model('Test', schema);
const D = Test.discriminator('D', new Schema({
  otherProp: {
    type: String,
    get(v) {
      console.log('Discriminator schema getter');
      return v;
    }
  }
}));

const doc = new D({ name: 'test', otherProp: 'test' });
// In Mongoose 8, prints "Base schema getter" followed by "Discriminator schema getter"
// In Mongoose 7, prints "Discriminator schema getter" followed by "Base schema getter"
console.log(doc.toObject({ getters: true }));
```

## Removed `overwrite` option for `findOneAndUpdate()` {#removed-overwrite-option-for-findoneandupdate}

Mongoose 7 and earlier supported an `overwrite` option for `findOneAndUpdate()`, `updateOne()`, and `update()`.
Before Mongoose 7, `overwrite` would skip wrapping the `update` parameter in `$set`, which meant that `findOneAndUpdate()` and `update()` would overwrite the matched document.
In Mongoose 7, setting `overwrite` would convert `findOneAndUpdate()` to `findOneAndReplace()` and `updateOne()` to `replaceOne()` to retain backwards compatibility.

In Mongoose 8, the `overwrite` option is no longer supported.
If you want to overwrite the entire document, use `findOneAndReplace()` or `replaceOne()`.

## Changed behavior for `findOneAndUpdate()` with `orFail()` and upsert {#changed-behavior-for-findoneandupdate-with-orfail-and-upsert}

In Mongoose 7, `findOneAndUpdate(filter, update, { upsert: true }).orFail()` would throw a `DocumentNotFoundError` if a new document was upserted.
In other words, `findOneAndUpdate().orFail()` always threw an error if no document was found, even if a new document was upserted.

In Mongoose 8, `findOneAndUpdate(filter, update, { upsert: true }).orFail()` always succeeds.
`findOneAndUpdate().orFail()` now throws a `DocumentNotFoundError` if there's no document returned, rather than if no document was found.

## Create waits until all saves are done before throwing any error {#create-waits-until-all-saves-are-done-before-throwing-any-error}

In Mongoose 7, `create()` would immediately throw if any `save()` threw an error by default.
Mongoose 8 instead waits for all `save()` calls to finish before throwing the first error that occurred.
So `create()` will throw the same error in both Mongoose 7 and Mongoose 8, Mongoose 8 just may take longer to throw the error.

```javascript
const schema = new Schema({
  name: {
    type: String,
    enum: ['Badger', 'Mushroom']
  }
});
schema.pre('save', async function() {
  await new Promise(resolve => setTimeout(resolve, 1000));
});
const Test = mongoose.model('Test', schema);

const err = await Test.create([
  { name: 'Badger' },
  { name: 'Mushroom' },
  { name: 'Cow' }
]).then(() => null, err => err);
err; // ValidationError

// In Mongoose 7, there would be 0 documents, because `Test.create()`
// would throw before 'Badger' and 'Mushroom' are inserted
// In Mongoose 8, there will be 2 documents. `Test.create()` waits until
// 'Badger' and 'Mushroom' are inserted before throwing.
await Test.countDocuments();
```

## `Model.validate()` returns copy of object {#model-validate-returns-copy-of-object}

In Mongoose 7, `Model.validate()` would potentially modify the passed in object.
Mongoose 8 instead copies the passed in object first.

```javascript
const schema = new Schema({ answer: Number });
const Test = mongoose.model('Test', schema);

const obj = { answer: '42' };
const res = Test.validate(obj);

typeof obj.answer; // 'string' in Mongoose 8, 'number' in Mongoose 7 
typeof res.answer; // 'number' in both Mongoose 7 and Mongoose 8
```

## Allow `null` For Optional Fields in TypeScript {#allow-null-for-optional-fields-in-typescript}

In Mongoose 8, automatically inferred schema types in TypeScript allow `null` for optional fields.
In Mongoose 7, optional fields only allowed `undefined`, not `null`.

```typescript
const schema = new Schema({ name: String });
const TestModel = model('Test', schema);

const doc = new TestModel();

// In Mongoose 8, this type is `string | null | undefined`.
// In Mongoose 7, this type is `string | undefined`
doc.name;
```

## Model constructor properties are all optional in TypeScript {#model-constructor-properties-are-all-optional-in-typescript}

In Mongoose 8, no properties are required on model constructors by default.

```ts
import {Schema, model, Model} from 'mongoose';

interface IDocument {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  { name: { type: String, required: true } },
  { timestamps: true }
);

const TestModel = model<IDocument>('Document', documentSchema);

// Would throw a compile error in Mongoose 7, compiles in Mongoose 8
const newDoc = new TestModel({
  name: 'Foo'
});

// Explicitly pass generic param to constructor to specify the expected
// type of the model constructor param. The following will cause TS
// to complain about missing `createdAt` and `updatedAt` in Mongoose 8.
const newDoc2 = new TestModel<IDocument>({
  name: 'Foo'
});
```

## Infer `distinct()` return types from schema {#infer-distinct-return-types-from-schema}

```ts
interface User {
  name: string;
  email: string;
  avatar?: string;
}
const schema = new Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  avatar: String
});

// Works in Mongoose 8. Compile error in Mongoose 7.
const names: string[] = await MyModel.distinct('name');
```

<!-- END COPIED CONTENT -->

---

## docs/migrating_to_9.md

Original file: [docs/migrating_to_9.md](../../migrating_to_9.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Migrating from 8.x to 9.x

<style>
  ul > li {
    padding: 4px 0px;
  }
</style>

There are several backwards-breaking changes you should be aware of when migrating from Mongoose 8.x to Mongoose 9.x.

If you're still on Mongoose 7.x or earlier, please read the [Mongoose 7.x to 8.x migration guide](migrating_to_8.html) and upgrade to Mongoose 8.x first before upgrading to Mongoose 9.

## Pre middleware no longer supports `next()`

In Mongoose 9, pre middleware no longer receives a `next()` parameter.
Instead, you should use `async` functions or promises to handle async pre middleware.

```javascript
// Worked in Mongoose 8.x, no longer supported in Mongoose 9!
schema.pre('save', function(next) {
  // Do something async
  next();
});

// Mongoose 9.x example usage
schema.pre('save', async function() {
  // Do something async
});
// or use promises:
schema.pre('save', function() {
  return new Promise((resolve, reject) => {
    // Do something async
    resolve();
  });
});
```

## `Schema.prototype.doValidate()` now returns a promise

`Schema.prototype.doValidate()` now returns a promise that rejects with a validation error if one occurred.
In Mongoose 8.x, `doValidate()` took a callback and did not return a promise.

```javascript
// Mongoose 8.x function signature
function doValidate(value, cb, scope, options) {}

// Mongoose 8.x example usage
schema.doValidate(value, function(error) {
  if (error) {
    // Handle validation error
  }
}, scope, options);

// Mongoose 9.x function signature
async function doValidate(value, scope, options) {}

// Mongoose 9.x example usage
try {
  await schema.doValidate(value, scope, options);
} catch (error) {
  // Handle validation error
}
```

## Update pipelines disallowed by default

As of MongoDB 4.2, you can pass an array of pipeline stages to `updateOne()`, `updateMany()`, and `findOneAndUpdate()` to modify the document in multiple stages.
Mongoose does not cast update pipelines at all, so for Mongoose 9 we've made using update pipelines throw an error by default.

```javascript
// Throws in Mongoose 9. Works in Mongoose 8
await Model.updateOne({}, [{ $set: { newProp: 'test2' } }]);
```

Set `updatePipeline: true` to enable update pipelines.

```javascript
// Works in Mongoose 9
await Model.updateOne({}, [{ $set: { newProp: 'test2' } }], { updatePipeline: true });
```

You can also set `updatePipeline` globally to enable update pipelines for all update operations by default.

```javascript
// Enable update pipelines globally
mongoose.set('updatePipeline', true);

// Now update pipelines work without needing to specify the option on each query
await Model.updateOne({}, [{ $set: { newProp: 'test2' } }]);

// You can still override the global setting per query
await Model.updateOne({}, [{ $set: { newProp: 'test2' } }], { updatePipeline: false }); // throws
```

## Removed background option for indexes

[MongoDB no longer supports the `background` option for indexes as of MongoDB 4.2](https://www.mongodb.com/docs/manual/core/index-creation/#index-operations). Mongoose 9 will no longer set the background option by default and Mongoose 9 no longer supports setting the `background` option on `Schema.prototype.index()`.

## `mongoose.isValidObjectId()` returns false for numbers

In Mongoose 8, you could create a new ObjectId from a number, and `isValidObjectId()` would return `true` for numbers. In Mongoose 9, `isValidObjectId()` will return `false` for numbers and you can no longer create a new ObjectId from a number.

```javascript
// true in mongoose 8, false in mongoose 9
mongoose.isValidObjectId(6);

// Works in Mongoose 8, throws in Mongoose 9
new mongoose.Types.ObjectId(6);
```

## Subdocument `deleteOne()` hooks execute only when subdocument is deleted

Currently, calling `deleteOne()` on a subdocument will execute the `deleteOne()` hooks on the subdocument regardless of whether the subdocument is actually deleted.

```javascript
const SubSchema = new Schema({
  myValue: {
    type: String
  }
}, {});
let count = 0;
SubSchema.pre('deleteOne', { document: true, query: false }, function(next) {
  count++;
  next();
});
const schema = new Schema({
  foo: {
    type: String,
    required: true
  },
  mySubdoc: {
    type: [SubSchema],
    required: true
  }
}, { minimize: false, collection: 'test' });

const Model = db.model('TestModel', schema);

const newModel = {
  foo: 'bar',
  mySubdoc: [{ myValue: 'some value' }]
};
const doc = await Model.create(newModel);

// In Mongoose 8, the following would trigger the `deleteOne` hook, even if `doc` is not saved or deleted.
doc.mySubdoc[0].deleteOne();

// In Mongoose 9, you would need to either `save()` or `deleteOne()` on `doc` to trigger the subdocument `deleteOne` hook.
await doc.save();
```

## Hooks for custom methods and statics no longer support callbacks

Previously, you could use Mongoose middleware with custom methods and statics that took callbacks.
In Mongoose 9, this is no longer supported.
If you want to use Mongoose middleware with a custom method or static, that custom method or static must be an async function or return a Promise.

```javascript
const mySchema = new Schema({
  name: String
});

// This is an example of a custom method that uses callbacks. While this method by itself still works in Mongoose 9,
// Mongoose 9 no longer supports hooks for this method.
mySchema.methods.foo = async function(cb) {
  return cb(null, this.name);
};
mySchema.statics.bar = async function(cb) {
  return cb(null, 'bar');
};

// This is no longer supported because `foo()` and `bar()` use callbacks.
mySchema.pre('foo', function() {
  console.log('foo pre hook');
});
mySchema.pre('bar', function() {
  console.log('bar pre hook');
});

// The following code has a custom method and a custom static that use async functions.
// The following works correctly in Mongoose 9: `pre('bar')` is executed when you call `bar()` and
// `pre('qux')` is executed when you call `qux()`.
mySchema.methods.baz = async function baz(arg) {
  return arg;
};
mySchema.pre('baz', async function baz() {
  console.log('baz pre hook');
});
mySchema.statics.qux = async function qux(arg) {
  return arg;
};
mySchema.pre('qux', async function qux() {
  console.log('qux pre hook');
});
```

## `Document.prototype.updateOne` no longer accepts a callback

`Document.prototype.updateOne` still supported callbacks in Mongoose 8. In Mongoose 9, the callback parameter was removed.

```javascript
const doc = await TestModel.findOne().orFail();

// Worked in Mongoose 8, no longer supported in Mongoose 9.
doc.updateOne({ name: 'updated' }, null, (err, res) => {
  if (err) throw err;
  console.log(res);
});
```

## Removed `promiseOrCallback`

Mongoose 9 removed the `promiseOrCallback` helper function.

```javascript
const { promiseOrCallback } = require('mongoose');

promiseOrCallback; // undefined in Mongoose 9
```

## `isAsync` middleware no longer supported

Mongoose 9 no longer supports `isAsync` middleware. Middleware functions that use the legacy signature with both `next` and `done` callbacks (i.e., `function(next, done)`) are not supported. We recommend middleware now use promises or async/await.

If you have code that uses `isAsync` middleware, you must refactor it to use async functions or return a promise instead.

```javascript
// ❌ Not supported in Mongoose 9
const schema = new Schema({});

schema.pre('save', true, function(next, done) {
  execed.first = true;
  setTimeout(
    function() {
      done(new Error('first done() error'));
    },
    5);

  next();
});

schema.pre('save', true, function(next, done) {
  execed.second = true;
  setTimeout(
    function() {
      next(new Error('second next() error'));
      done(new Error('second done() error'));
    },
    25);
});

// ✅ Supported in Mongoose 9: use async functions or return a promise
schema.pre('save', async function() {
  execed.first = true;
  await new Promise(resolve => setTimeout(resolve, 5));
});

schema.pre('save', async function() {
  execed.second = true;
  await new Promise(resolve => setTimeout(resolve, 25));
});
```

## Removed `skipOriginalStackTraces` option

In Mongoose 8, Mongoose queries store an `_executionStack` property that stores the stack trace of where the query was originally executed for debugging `Query was already executed` errors.
This behavior can cause performance issues with bundlers and source maps.
`skipOriginalStackTraces` was added to work around this behavior.
In Mongoose 9, this option is no longer necessary because Mongoose no longer stores the original stack trace.

## Node.js version support

Mongoose 9 requires Node.js 18 or higher.

## UUID's are now MongoDB UUID objects

Mongoose 9 now returns UUID objects as instances of `bson.UUID`. In Mongoose 8, UUIDs were Mongoose Buffers that were converted to strings via a getter.

```javascript
const schema = new Schema({ uuid: 'UUID' });
const TestModel = mongoose.model('Test', schema);

const test = new TestModel({ uuid: new bson.UUID() });
await test.save();

test.uuid; // string in Mongoose 8, bson.UUID instance in Mongoose 9
```

With this change, UUIDs will be represented in hex string format in JSON, even if `getters: true` is not set.

If you want to convert UUIDs to strings via a getter by default, you can use `mongoose.Schema.Types.UUID.get()`:

```javascript
// Configure all UUIDs to have a getter which converts the UUID to a string
mongoose.Schema.Types.UUID.get(v => v == null ? v : v.toString());

const schema = new Schema({ uuid: 'UUID' });
const TestModel = mongoose.model('Test', schema);

const test = new TestModel({ uuid: new bson.UUID() });
await test.save();

test.uuid; // string
```

### SchemaType `caster` and `casterConstructor` properties were removed

In Mongoose 8, certain schema type instances had a `caster` property which contained either the embedded schema type or embedded subdocument constructor.
In Mongoose 9, to make types and internal logic more consistent, we removed the `caster` property in favor of `embeddedSchemaType` and `Constructor`.

```javascript
const schema = new mongoose.Schema({ docArray: [new mongoose.Schema({ name: String })], arr: [String] });

// In Mongoose 8:
console.log(schema.path('arr').caster); // SchemaString
console.log(schema.path('docArray').caster); // EmbeddedDocument constructor

console.log(schema.path('arr').casterConstructor); // SchemaString constructor
console.log(schema.path('docArray').casterConstructor); // EmbeddedDocument constructor

// In Mongoose 9:
console.log(schema.path('arr').embeddedSchemaType); // SchemaString
console.log(schema.path('docArray').embeddedSchemaType); // SchemaDocumentArrayElement

console.log(schema.path('arr').Constructor); // undefined
console.log(schema.path('docArray').Constructor); // EmbeddedDocument constructor
```

In Mongoose 8, there was also an internal `$embeddedSchemaType` property. That property has been replaced with `embeddedSchemaType`, which is now part of the public API.

### Removed `skipId` parameter to `Model()` and `Document()`

In Mongoose 8, the 3rd parameter to `Model()` and `Document()` was either a boolean or `options` object.
If a boolean, Mongoose would interpret the 3rd parameter as the `skipId` option.
In Mongoose 9, the 3rd parameter is always an `options` object, passing a `boolean` is no longer supported.

### Query use$geoWithin removed, now always true

`mongoose.Query` had a `use$geoWithin` property that could configure converting `$geoWithin` to `$within` to support MongoDB versions before 2.4.
That property has been removed in Mongoose 9. `$geoWithin` is now never converted to `$within`, because MongoDB no longer supports `$within`.

### Removed `noListener` option from `useDb()`/connections

The `noListener` option has been removed from connections and from the `useDb()` method. In Mongoose 8.x, you could call `useDb()` with `{ noListener: true }` to prevent the new connection object from listening to state changes on the base connection, which was sometimes useful to reduce memory usage when dynamically creating connections for every request.

In Mongoose 9.x, the `noListener` option is no longer supported or documented. The second argument to `useDb()` now only supports `{ useCache }`.

```javascript
// Mongoose 8.x
conn.useDb('myDb', { noListener: true }); // works

// Mongoose 9.x
conn.useDb('myDb', { noListener: true }); // TypeError: noListener is not a supported option
conn.useDb('myDb', { useCache: true }); // works
```

## TypeScript

### FilterQuery renamed to QueryFilter

In Mongoose 9, `FilterQuery` (the first parameter to `Model.find()`, `Model.findOne()`, etc.) was renamed to `QueryFilter`.

### QueryFilter Properties No Longer Resolve to any

In Mongoose 9, the `QueryFilter` type, which is the type of the first param to `Model.find()`, `Model.findOne()`, etc. now enforces stronger types for top-level keys.

```typescript
const schema = new Schema({ age: Number });
const TestModel = mongoose.model('Test', schema);

TestModel.find({ age: 'not a number' }); // Works in Mongoose 8, TS error in Mongoose 9
TestModel.find({ age: { $notAnOperator: 42 } }); // Works in Mongoose 8, TS error in Mongoose 9
```

This change is backwards breaking if you use generics when creating queries as shown in the following example.
If you run into the following issue or any similar issues, you can use `as QueryFilter`.

```typescript
// From https://stackoverflow.com/questions/56505560/how-to-fix-ts2322-could-be-instantiated-with-a-different-subtype-of-constraint:
// "Never assign a concrete type to a generic type parameter, consider it as read-only!"
// This function is generally something you shouldn't do in TypeScript, can work around it with `as` though.
function findById<ModelType extends {_id: Types.ObjectId | string}>(model: Model<ModelType>, _id: Types.ObjectId | string) {
  return model.find({_id: _id} as QueryFilter<ModelType>); // In Mongoose 8, this `as` was not required
}
```

### No more generic parameter for `create()` and `insertOne()`

In Mongoose 8, `create()` and `insertOne()` accepted a generic parameter, which meant TypeScript let you pass any value to the function.

```ts
const schema = new Schema({ age: Number });
const TestModel = mongoose.model('Test', schema);

// Worked in Mongoose 8, TypeScript error in Mongoose 9
const doc = await TestModel.create({ age: 'not a number', someOtherProperty: 'value' });
```

In Mongoose 9, `create()` and `insertOne()` no longer accept a generic parameter. Instead, they accept `Partial<RawDocType>` with some additional query casting applied that allows objects for maps, strings for ObjectIds, and POJOs for subdocuments and document arrays.

If your parameters to `create()` don't match `Partial<RawDocType>`, you can use `as` to cast as follows.

```ts
const doc = await TestModel.create({ age: 'not a number', someOtherProperty: 'value' } as unknown as Partial<InferSchemaType<typeof schema>>);
```

### Document `id` is no longer `any`

In Mongoose 8 and earlier, `id` was a property on the `Document` class that was set to `any`.
This was inconsistent with runtime behavior, where `id` is a virtual property that returns `_id` as a string, unless there is already an `id` property on the schema or the schema has the `id` option set to `false`.

Mongoose 9 appends `id` as a string property to `TVirtuals`. The `Document` class no longer has an `id` property.

```ts
const schema = new Schema({ age: Number });
const TestModel = mongoose.model('Test', schema);

const doc = new TestModel();
doc.id; // 'string' in Mongoose 9, 'any' in Mongoose 8.
```

<!-- END COPIED CONTENT -->

---

## migrating_to_5.md

Original file: [migrating_to_5.md](../../../migrating_to_5.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

This guide has moved to the [Mongoose docs site](https://mongoosejs.com/docs/migrating_to_5.html).

<!-- END COPIED CONTENT -->

---

## docs/lambda.md

Original file: [docs/lambda.md](../../lambda.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Using Mongoose With AWS Lambda

[AWS Lambda](https://aws.amazon.com/lambda/) is a popular service for running
arbitrary functions without managing individual servers. Using Mongoose in your
AWS Lambda functions is easy. Here's a sample function that connects to a
MongoDB instance and finds a single document:

```javascript
const mongoose = require('mongoose');

let conn = null;

const uri = 'YOUR CONNECTION STRING HERE';

exports.handler = async function(event, context) {
  // Make sure to add this so you can re-use `conn` between function calls.
  // See https://www.mongodb.com/blog/post/serverless-development-with-nodejs-aws-lambda-mongodb-atlas
  context.callbackWaitsForEmptyEventLoop = false;

  // Because `conn` is in the global scope, Lambda may retain it between
  // function calls thanks to `callbackWaitsForEmptyEventLoop`.
  // This means your Lambda function doesn't have to go through the
  // potentially expensive process of connecting to MongoDB every time.
  if (conn == null) {
    conn = mongoose.createConnection(uri, {
      // and tell the MongoDB driver to not wait more than 5 seconds
      // before erroring out if it isn't connected
      serverSelectionTimeoutMS: 5000
    });

    // `await`ing connection after assigning to the `conn` variable
    // to avoid multiple function calls creating new connections
    await conn.asPromise();
    conn.model('Test', new mongoose.Schema({ name: String }));
  }

  const M = conn.model('Test');

  const doc = await M.findOne();
  console.log(doc);

  return doc;
};
```

## Connection Helper

The above code works fine for a single Lambda function, but what if you want to reuse the same connection logic in multiple Lambda functions?
You can export the below function.

```javascript
const mongoose = require('mongoose');

let conn = null;

const uri = 'YOUR CONNECTION STRING HERE';

exports.connect = async function() {
  if (conn == null) {
    conn = mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 5000
    });

    // `await`ing connection after assigning to the `conn` variable
    // to avoid multiple function calls creating new connections
    await conn.asPromise();
  }

  return conn;
};
```

## Using `mongoose.connect()`

You can also use `mongoose.connect()`, so you can use `mongoose.model()` to create models.

```javascript
const mongoose = require('mongoose');

let conn = null;

const uri = 'YOUR CONNECTION STRING HERE';

exports.connect = async function() {
  if (conn == null) {
    conn = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    }).then(() => mongoose);

    // `await`ing connection after assigning to the `conn` variable
    // to avoid multiple function calls creating new connections
    await conn;
  }

  return conn;
};
```

<!-- END COPIED CONTENT -->

---

## docs/nextjs.md

Original file: [docs/nextjs.md](../../nextjs.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Using Mongoose With [Next.js](https://nextjs.org/)

Next.js is a popular framework for building full stack applications with React.
Mongoose works out of the box with Next.js.
If you're looking to get started, please use [Next.js' official Mongoose sample app](https://github.com/vercel/next.js/tree/canary/examples/with-mongodb-mongoose).
Furthermore, if you are using Next.js with [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions), please review [Mongoose's AWS Lambda docs](https://mongoosejs.com/docs/lambda.html).

## Quick Start

Here's a basic example of using Mongoose with Next.js App Router:

```javascript
// lib/mongodb.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

export default dbConnect;

async function dbConnect() {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }
  await mongoose.connect(MONGODB_URI);
  return mongoose;
}
```

Then use it in your API routes or Server Components:

```javascript
// app/api/users/route.js
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  await dbConnect();
  const users = await User.find({});
  return Response.json({ users });
}
```

## Best Practices

### Connection Management

Mongoose handles connection management automatically. Calling `mongoose.connect()` when Mongoose is already connected is a no-op, so you can safely call `dbConnect()` in every API route and Server Component without worrying about creating multiple connections.

### Environment Variables

Store your MongoDB connection string in `.env.local`:

```bash
MONGODB_URI=mongodb://localhost:27017/mydb
```

For production, use environment variables in your hosting platform (Vercel, Netlify, etc.).

### Model Registration

Define your models in a separate directory and ensure they're only registered once:

```javascript
// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
```

The `mongoose.models.User || mongoose.model('User', UserSchema)` pattern prevents model recompilation errors during hot reloading in development.

## Common Issues

There are a few common issues when working with Next.js that you should be aware of.

## TypeError: Cannot read properties of undefined (reading 'prototype')

You can fix this issue by adding the following to your `next.config.js`:

```js
const nextConfig = {
  experimental: {
    esmExternals: "loose", // <-- add this
    serverComponentsExternalPackages: ["mongoose"] // <-- and this
  },
  // and the following to enable top-level await support for Webpack
  webpack: (config) => {
    config.experiments = {
      topLevelAwait: true
    };
    return config;
  },
}
```

This issue is caused by [this change in MongoDB's bson parser](https://github.com/mongodb/js-bson/pull/564/files).
MongoDB's bson parser uses top-level await and dynamic import in ESM mode to avoid some Webpack bundling issues.
And Next.js forces ESM mode.

## Using with Pages Router

If you're using Next.js Pages Router, you can use Mongoose in API routes and `getServerSideProps`:

```javascript
// pages/api/users.js
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    const users = await User.find({});
    return res.status(200).json({ users });
  }

  if (req.method === 'POST') {
    const user = await User.create(req.body);
    return res.status(201).json({ user });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
```

Using in `getServerSideProps`:

```javascript
// pages/users.js
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function getServerSideProps() {
  await dbConnect();
  const users = await User.find({});
  
  return {
    props: {
      users: JSON.parse(JSON.stringify(users))
    }
  };
}

export default function UsersPage({ users }) {
  return (
    <div>
      <h1>Users</h1>
      {users.map(user => (
        <div key={user._id.toString()}>{user.name}</div>
      ))}
    </div>
  );
}
```

**Important:** Use `JSON.parse(JSON.stringify())` to convert Mongoose documents to plain objects, as Next.js requires serializable data.

## Using with App Router Server Components

With Next.js 13+ App Router, you can use Mongoose directly in Server Components:

```javascript
// app/users/page.js
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export const runtime = 'nodejs';

export default async function UsersPage() {
  await dbConnect();
  const users = await User.find({}).lean();

  return (
    <div>
      <h1>Users</h1>
      {users.map(user => (
        <div key={user._id.toString()}>{user.name}</div>
      ))}
    </div>
  );
}
```

## Next.js Edge Runtime

Mongoose does **not** currently support [Next.js Edge Runtime](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes#edge-runtime).
There is no way for Mongoose to connect to MongoDB in Edge Runtime, because [Edge Runtime currently doesn't support Node.js `net` API](https://edge-runtime.vercel.app/features/available-apis#unsupported-apis), which is what the MongoDB Node Driver uses to connect to MongoDB.

## Additional Resources

* [Next.js Official Mongoose Example](https://github.com/vercel/next.js/tree/canary/examples/with-mongodb-mongoose)
* [Mongoose AWS Lambda Guide](https://mongoosejs.com/docs/lambda.html) (for serverless deployments)
* [Next.js Data Fetching Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching)

<!-- END COPIED CONTENT -->

---

## docs/browser.md

Original file: [docs/browser.md](../../browser.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Mongoose in the Browser

As of Mongoose 9, [Mongoose's browser build is now in the `@mongoosejs/browser` npm package](https://github.com/mongoosejs/mongoose-browser).
The documentation has been moved to the [`@mongoosejs/browser` README](https://github.com/mongoosejs/mongoose-browser?tab=readme-ov-file#mongoosejsbrowser).

<!-- END COPIED CONTENT -->
