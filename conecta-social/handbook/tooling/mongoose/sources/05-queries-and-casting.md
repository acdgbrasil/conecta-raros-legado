# Sources for 05-queries-and-casting

This file copies Markdown content from the repo for this chapter. For deeper info, open the original file linked under each section.

---

## docs/queries.md

Original file: [docs/queries.md](../../queries.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Queries

Mongoose [models](models.html) provide several static helper functions
for [CRUD operations](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete).
Each of these functions returns a
[mongoose `Query` object](api/query.html#Query).

* [`Model.deleteMany()`](api.html#model_Model-deleteMany)
* [`Model.deleteOne()`](api.html#model_Model-deleteOne)
* [`Model.find()`](api.html#model_Model-find)
* [`Model.findById()`](api.html#model_Model-findById)
* [`Model.findByIdAndDelete()`](api.html#model_Model-findByIdAndDelete)
* [`Model.findByIdAndRemove()`](api.html#model_Model-findByIdAndRemove)
* [`Model.findByIdAndUpdate()`](api.html#model_Model-findByIdAndUpdate)
* [`Model.findOne()`](api.html#model_Model-findOne)
* [`Model.findOneAndDelete()`](api.html#model_Model-findOneAndDelete)
* [`Model.findOneAndReplace()`](api.html#model_Model-findOneAndReplace)
* [`Model.findOneAndUpdate()`](api.html#model_Model-findOneAndUpdate)
* [`Model.replaceOne()`](api.html#model_Model-replaceOne)
* [`Model.updateMany()`](api.html#model_Model-updateMany)
* [`Model.updateOne()`](api.html#model_Model-updateOne)

Mongoose queries can be executed by using `await`, or by using `.then()` to handle the promise returned by the query.

<ul class="toc">
  <li><a href="#executing">Executing</a></li>
  <li><a href="#queries-are-not-promises">Queries are Not Promises</a></li>
  <li><a href="#refs">References to other documents</a></li>
  <li><a href="#streaming">Streaming</a></li>
  <li><a href="#versus-aggregation">Versus Aggregation</a></li>
</ul>

## Executing

When executing a query, you specify your query as a JSON document. The JSON document's syntax is the same as the [MongoDB shell](http://www.mongodb.com/docs/manual/tutorial/query-documents/).

```javascript
const Person = mongoose.model('Person', yourSchema);

// find each person with a last name matching 'Ghost', selecting the `name` and `occupation` fields
const person = await Person.findOne({ 'name.last': 'Ghost' }, 'name occupation');
// Prints "Space Ghost is a talk show host".
console.log('%s %s is a %s.', person.name.first, person.name.last, person.occupation);
```

What `person` is depends on the operation: For `findOne()` it is a [potentially-null single document](api/model.html#model_Model-findOne), `find()` a [list of documents](api/model.html#model_Model-find), `count()` [the number of documents](api/model.html#model_Model-count), `update()` the [number of documents affected](api/model.html#model_Model-update), etc.
The [API docs for Models](api/model.html) provide more details.

Now let's look at what happens when no `await` is used:

```javascript
// find each person with a last name matching 'Ghost'
const query = Person.findOne({ 'name.last': 'Ghost' });

// selecting the `name` and `occupation` fields
query.select('name occupation');

// execute the query at a later time
const person = await query.exec();
// Prints "Space Ghost is a talk show host."
console.log('%s %s is a %s.', person.name.first, person.name.last, person.occupation);
```

In the above code, the `query` variable is of type [Query](api/query.html).
A `Query` enables you to build up a query using chaining syntax, rather than specifying a JSON object.
The below 2 examples are equivalent.

```javascript
// With a JSON doc
await Person.
  find({
    occupation: /host/,
    'name.last': 'Ghost',
    age: { $gt: 17, $lt: 66 },
    likes: { $in: ['vaporizing', 'talking'] }
  }).
  limit(10).
  sort({ occupation: -1 }).
  select({ name: 1, occupation: 1 }).
  exec();

// Using query builder
await Person.
  find({ occupation: /host/ }).
  where('name.last').equals('Ghost').
  where('age').gt(17).lt(66).
  where('likes').in(['vaporizing', 'talking']).
  limit(10).
  sort('-occupation').
  select('name occupation').
  exec();
```

A full list of [Query helper functions can be found in the API docs](api/query.html).

## Queries are Not Promises

Mongoose queries are **not** promises.
Queries are [thenables](https://masteringjs.io/tutorials/fundamentals/thenable), meaning they have a `.then()` method for [async/await](http://thecodebarbarian.com/common-async-await-design-patterns-in-node.js.html) as a convenience.
However, unlike promises, calling a query's `.then()` executes the query, so calling `then()` multiple times will throw an error.

```javascript
const q = MyModel.updateMany({}, { isDeleted: true });

await q.then(() => console.log('Update 2'));
// Throws "Query was already executed: Test.updateMany({}, { isDeleted: true })"
await q.then(() => console.log('Update 3'));
```

## References to other documents {#refs}

There are no joins in MongoDB but sometimes we still want references to documents in other collections.
This is where [population](populate.html) comes in.
Read more about how to include documents from other collections in your query results in the [population documentation](api/query.html#query_Query-populate).

## Streaming {#streaming}

You can [stream](http://nodejs.org/api/stream.html) query results from
MongoDB. You need to call the
[Query#cursor()](api/query.html#query_Query-cursor) function to return an instance of [QueryCursor](api/query.html#query_Query-cursor).

```javascript
const cursor = Person.find({ occupation: /host/ }).cursor();

for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
  console.log(doc); // Prints documents one at a time
}
```

Iterating through a Mongoose query using [async iterators](https://thecodebarbarian.com/getting-started-with-async-iterators-in-node-js.html)
also creates a cursor.

```javascript
for await (const doc of Person.find()) {
  console.log(doc); // Prints documents one at a time
}
```

Cursors are subject to [cursor timeouts](https://stackoverflow.com/questions/21853178/when-a-mongodb-cursor-will-expire).
By default, MongoDB will close your cursor after 10 minutes and subsequent
`next()` calls will result in a `MongoServerError: cursor id 123 not found` error.
To override this, set the `noCursorTimeout` option on your cursor.

```javascript
// MongoDB won't automatically close this cursor after 10 minutes.
const cursor = Person.find().cursor().addCursorFlag('noCursorTimeout', true);
```

However, cursors can still time out because of [session idle timeouts](https://www.mongodb.com/docs/manual/reference/method/cursor.noCursorTimeout/#session-idle-timeout-overrides-nocursortimeout).
So even a cursor with `noCursorTimeout` set will still time out after 30 minutes
of inactivity. You can read more about working around session idle timeouts in the [MongoDB documentation](https://www.mongodb.com/docs/manual/reference/method/cursor.noCursorTimeout/#session-idle-timeout-overrides-nocursortimeout).

## Versus Aggregation {#versus-aggregation}

[Aggregation](api/aggregate.html#aggregate_Aggregate) can
do many of the same things that queries can. For example, below is
how you can use `aggregate()` to find docs where `name.last = 'Ghost'`:

```javascript
const docs = await Person.aggregate([{ $match: { 'name.last': 'Ghost' } }]);
```

However, just because you can use `aggregate()` doesn't mean you should.
In general, you should use queries where possible, and only use `aggregate()`
when you absolutely need to.

Unlike query results, Mongoose does **not** [`hydrate()`](api/model.html#model_Model-hydrate)
aggregation results. Aggregation results are always POJOs, not Mongoose
documents.

```javascript
const docs = await Person.aggregate([{ $match: { 'name.last': 'Ghost' } }]);

docs[0] instanceof mongoose.Document; // false
```

Also, unlike query filters, Mongoose also doesn't
[cast](tutorials/query_casting.html) aggregation pipelines. That means
you're responsible for ensuring the values you pass in to an aggregation
pipeline have the correct type.

```javascript
const doc = await Person.findOne();

const idString = doc._id.toString();

// Finds the `Person`, because Mongoose casts `idString` to an ObjectId
const queryRes = await Person.findOne({ _id: idString });

// Does **not** find the `Person`, because Mongoose doesn't cast aggregation
// pipelines.
const aggRes = await Person.aggregate([{ $match: { _id: idString } }]);
```

## Sorting {#sorting}

[Sorting](/docs/api.html#query_Query-sort) is how you can ensure your query results come back in the desired order.

```javascript
const personSchema = new mongoose.Schema({
  age: Number
});

const Person = mongoose.model('Person', personSchema);
for (let i = 0; i < 10; i++) {
  await Person.create({ age: i });
}

await Person.find().sort({ age: -1 }); // returns age starting from 10 as the first entry
await Person.find().sort({ age: 1 }); // returns age starting from 0 as the first entry
```

When sorting with mutiple fields, the order of the sort keys determines what key MongoDB server sorts by first.

```javascript
const personSchema = new mongoose.Schema({
  age: Number,
  name: String,
  weight: Number
});

const Person = mongoose.model('Person', personSchema);
const iterations = 5;
for (let i = 0; i < iterations; i++) {
  await Person.create({
    age: Math.abs(2 - i),
    name: 'Test' + i,
    weight: Math.floor(Math.random() * 100) + 1
  });
}

await Person.find().sort({ age: 1, weight: -1 }); // returns age starting from 0, but while keeping that order will then sort by weight.
```

You can view the output of a single run of this block below.
As you can see, age is sorted from 0 to 2 but when age is equal, sorts by weight.

```javascript
[
  {
    _id: new ObjectId('63a335a6b9b6a7bfc186cb37'),
    age: 0,
    name: 'Test2',
    weight: 67,
    __v: 0
  },
  {
    _id: new ObjectId('63a335a6b9b6a7bfc186cb35'),
    age: 1,
    name: 'Test1',
    weight: 99,
    __v: 0
  },
  {
    _id: new ObjectId('63a335a6b9b6a7bfc186cb39'),
    age: 1,
    name: 'Test3',
    weight: 73,
    __v: 0
  },
  {
    _id: new ObjectId('63a335a6b9b6a7bfc186cb33'),
    age: 2,
    name: 'Test0',
    weight: 65,
    __v: 0
  },
  {
    _id: new ObjectId('63a335a6b9b6a7bfc186cb3b'),
    age: 2,
    name: 'Test4',
    weight: 62,
    __v: 0
  }
];
```

## Next Up {#next}

Now that we've covered `Queries`, let's take a look at [Validation](validation.html).

<!-- END COPIED CONTENT -->

---

## docs/async-await.md

Original file: [docs/async-await.md](../../async-await.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Using Async/Await with Mongoose

* [Basic Use](#basic-use)
* [Async Functions](#async-functions)
* [Queries](#queries)

## Basic Use

Async/await lets us write asynchronous code as if it were synchronous.
This is especially helpful for avoiding callback hell when executing multiple async operations in sequence--a common scenario when working with Mongoose.
Each of the three functions below retrieves a record from the database, updates it, and prints the updated record to the console.

```javascript
// Using promise chaining
function thenUpdate() {
  MyModel.findOne({ firstName: 'franklin', lastName: 'roosevelt' })
    .then(function(doc) {
      doc.middleName = 'delano';
      return doc.save();
    })
    .then(console.log)
    .catch(function(err) {
      handleError(err);
    });
}

// Using async/await
async function awaitUpdate() {
  try {
    const doc = await MyModel.findOne({
      firstName: 'franklin',
      lastName: 'roosevelt'
    });

    doc.middleName = 'delano';

    console.log(await doc.save());
  }
  catch (err) {
    handleError(err);
  }
}
```

Note that the specific fulfillment values of different Mongoose methods vary, and may be affected by configuration. Please refer to the [API documentation](api/mongoose.html.html) for information about specific methods.

## Async Functions

Adding the keyword *async* to a JavaScript function automatically causes it to return a native JavaScript promise.
This is true [regardless of the return value we specify in the function body](http://thecodebarbarian.com/async-functions-in-javascript.html#an-async-function-always-returns-a-promise).

```javascript
async function getUser() {
  // Inside getUser, we can await an async operation and interact with
  // foundUser as a normal, non-promise value...
  const foundUser = await User.findOne({ name: 'bill' });

  console.log(foundUser); // Prints '{name: 'bill', admin: false}'
  return foundUser;
}

// However, because async functions always return a promise,
// user is a promise.
const user = getUser();

console.log(user); // Oops.  Prints '[Promise]'
```

Instead, treat the return value of an async function as you would any other promise.  Await its fulfillment inside another async function, or chain onto it using `.then` blocks.

```javascript
async function getUser() {
  const foundUser = await User.findOne({ name: 'bill' });
  return foundUser;
}

async function doStuffWithUser() {
  // Await the promise returned from calling getUser.
  const user = await getUser();

  console.log(user); // Prints '{name: 'bill', admin: false}'
}
```

## Async/Await with Mongoose Queries {#queries}

Under the hood, [async/await is syntactic sugar](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await) over the Promise API.
Due to the surprisingly simple way promises are implemented in JavaScript, the keyword `await` will try to unwrap any object with a property whose key is the string ‘then’ and whose value is a function.
Such objects belong to a broader class of objects called [thenables](https://masteringjs.io/tutorials/fundamentals/thenable).
If the thenable being unwrapped is a genuine promise, e.g. an instance of the [Promise constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), we enjoy several guarantees about how the object’s ‘then’ function will behave.
However, Mongoose provides several static helper methods that return a different class of thenable object called a [Query](queries.html)--and [Queries are not promises](queries.html#queries-are-not-promises).
Because Queries are also *thenables*, we can interact with a Query using async/await just as we would interact with a genuine promise, with one key difference: observing the fulfillment value of a genuine promise cannot under any circumstances change that value, but trying to re-observe the value of a Query may cause the Query to be re-executed.

```javascript
function isPromise(thenable) {
  return thenable instanceof Promise;
}

// The fulfillment value of the promise returned by user.save() will always be the same,
// regardless of how, or how often, we observe it.
async function observePromise() {
  const user = await User.findOne({ firstName: 'franklin', lastName: 'roosevelt' });

  user.middleName = 'delano';

  // Document.prototype.save() returns a *genuine* promise
  const realPromise = user.save();

  console.log(isPromise(realPromise)); // true

  const awaitedValue = await realPromise;

  realPromise.then(chainedValue => console.log(chainedValue === awaitedValue)); // true
}

// By contrast, the value we receive when we try to observe the same Query more than
// once is different every time.  The Query is re-executing.
async function observeQuery() {
  const query = User.findOne({ firstName: 'leroy', lastName: 'jenkins' });

  console.log(isPromise(query)); // false

  const awaitedValue = await query;

  query.then(chainedValue => console.log(chainedValue === awaitedValue)); // false
}
```

You are most likely to accidentally re-execute queries in this way when mixing callbacks with async/await.
This is never necessary and should be avoided.
If you need a Query to return a fully-fledged promise instead of a [thenable](https://masteringjs.io/tutorials/fundamentals/thenable), you can use [Query#exec()](api/query.html#query_Query-exec).

<!-- END COPIED CONTENT -->

---

## docs/promises.md

Original file: [docs/promises.md](../../promises.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Promises

## Built-in Promises

Mongoose async operations, like `.save()` and queries, return thenables.
This means that you can do things like `MyModel.findOne({}).then()` and
`await MyModel.findOne({}).exec()` if you're using
[async/await](http://thecodebarbarian.com/80-20-guide-to-async-await-in-node.js.html).

You can find the return type of specific operations [in the api docs](api/mongoose.html)
You can also read more about [promises in Mongoose](https://masteringjs.io/tutorials/mongoose/promise).

```acquit
[require:Built-in Promises]
```

## Queries are not promises

[Mongoose queries](http://mongoosejs.com/docs/queries.html) are **not** promises. They have a `.then()`
function for [co](https://www.npmjs.com/package/co) and async/await as
a convenience. If you need
a fully-fledged promise, use the `.exec()` function.

```acquit
[require:Queries are not promises]
```

## Queries are thenable

Although queries are not promises, queries are [thenables](https://promisesaplus.com/#terminology).
That means they have a `.then()` function, so you can use queries as promises with either
promise chaining or [async await](https://asyncawait.net)

```acquit
[require:Queries are thenable]
```

## Should You Use `exec()` With `await`?

There are two alternatives for using `await` with queries:

* `await Band.findOne();`
* `await Band.findOne().exec();`

As far as functionality is concerned, these two are equivalent.
However, we recommend using `.exec()` because that gives you
better stack traces.

```acquit
[require:Should You Use `exec\(\)` With `await`]
```

<i>
  Want to learn how to check whether your favorite npm modules work with
  async/await without cobbling together contradictory answers from Google
  and Stack Overflow? Chapter 4 of Mastering Async/Await explains the
  basic principles for determining whether frameworks like React and
  Mongoose support async/await.
  <a href="http://asyncawait.net/?utm_source=mongoosejs&utm_campaign=promises">Get your copy!</a>
</i>
<br><br>
<a href="http://asyncawait.net/?utm_source=mongoosejs&utm_campaign=promises" style="margin-left: 100px">
  <img src="/docs/images/asyncawait.png" style="width: 650px" alt="Mastering Async/Await" />
</a>

<!-- END COPIED CONTENT -->

---

## docs/tutorials/query_casting.md

Original file: [docs/tutorials/query_casting.md](../../tutorials/query_casting.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Query Casting

The first parameter to [`Model.find()`](../api/model.html#model_Model-find), [`Query#find()`](../api/query.html#query_Query-find), [`Model.findOne()`](../api/model.html#model_Model-findOne), etc. is called `filter`.
In older content this parameter is sometimes called `query` or `conditions`. For example:

```acquit
[require:Cast Tutorial.*get and set]
```

When you execute the query using [`Query#exec()`](../api/query.html#query_Query-exec) or [`Query#then()`](../api/query.html#query_Query-then), Mongoose *casts* the filter to match your schema.

```acquit
[require:Cast Tutorial.*cast values]
```

If Mongoose fails to cast the filter to your schema, your query will throw a `CastError`.

```acquit
[require:Cast Tutorial.*cast error]
```

## The `strictQuery` Option

By default, Mongoose does **not** cast filter properties that aren't in your schema.

```acquit
[require:Cast Tutorial.*not in schema]
```

You can configure this behavior using the [`strictQuery` option for schemas](../guide.html#strictQuery). This option is analogous to the [`strict` option](../guide.html#strict). Setting `strictQuery` to `true` removes non-schema properties from the filter:

```acquit
[require:Cast Tutorial.*strictQuery true]
```

To make Mongoose throw an error if your `filter` has a property that isn't in the schema, set `strictQuery` to `'throw'`:

```acquit
[require:Cast Tutorial.*strictQuery throw]
```

## Implicit `$in`

Because of schemas, Mongoose knows what types fields should be, so it can provide some neat syntactic sugar. For example, if you forget to put [`$in`](https://www.mongodb.com/docs/manual/reference/operator/query/in/) on a non-array field, Mongoose will add `$in` for you.

```acquit
[require:Cast Tutorial.*implicit in]
```

<!-- END COPIED CONTENT -->

---

## docs/tutorials/custom-casting.md

Original file: [docs/tutorials/custom-casting.md](../../tutorials/custom-casting.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Custom Casting

[Mongoose 5.4.0](https://github.com/Automattic/mongoose/blob/master/CHANGELOG.md#540--2018-12-14) introduced [several ways to configure SchemaTypes globally](http://thecodebarbarian.com/whats-new-in-mongoose-54-global-schematype-configuration).
One of these new features is the [`SchemaType.cast()` function](../api/schematype.html#schematype_SchemaType-cast), which enables you to override Mongoose's built-in casting.

For example, by default Mongoose will throw an error if you attempt to cast
a string that contains a Japanese numeral to a number.

```acquit
[require:custom casting.*casting error]
```

You can overwrite the default casting function for numbers to allow converting
the string that contains the Japanese numeral "2" to a number as shown below.

```acquit
[require:custom casting.*casting override]
```

<!-- END COPIED CONTENT -->

---

## docs/tutorials/findoneandupdate.md

Original file: [docs/tutorials/findoneandupdate.md](../../tutorials/findoneandupdate.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# How to Use `findOneAndUpdate()` in Mongoose

The [`findOneAndUpdate()` function in Mongoose](../api/query.html#query_Query-findOneAndUpdate) has a wide variety of use cases. [You should use `save()` to update documents where possible](https://masteringjs.io/tutorials/mongoose/update), for better [validation](../validation.html) and [middleware](../middleware.html) support.
However, there are some cases where you need to use [`findOneAndUpdate()`](https://masteringjs.io/tutorials/mongoose/findoneandupdate). In this tutorial, you'll see how to use `findOneAndUpdate()`, and learn when you need to use it.

* [Getting Started](#getting-started)
* [Atomic Updates](#atomic-updates)
* [Upsert](#upsert)
* [The `includeResultMetadata` Option](#includeresultmetadata)
* [Updating Discriminator Keys](#updating-discriminator-keys)

## Getting Started

As the name implies, `findOneAndUpdate()` finds the first document that matches a given `filter`, applies an `update`, and returns the document.
The `findOneAndUpdate()` function has the following signature:

```javascript
function findOneAndUpdate(filter, update, options) {}
```

By default, `findOneAndUpdate()` returns the document as it was **before** `update` was applied.
In the following example, `doc` initially only has `name` and `_id` properties.
`findOneAndUpdate()` adds an `age` property, but the result of `findOneAndUpdate()` does **not** have an `age` property.

```acquit
[require:Tutorial.*findOneAndUpdate.*basic case]
```

You should set the `new` option to `true` to return the document **after** `update` was applied.

```acquit
[require:Tutorial.*findOneAndUpdate.*new option]
```

Mongoose's `findOneAndUpdate()` is slightly different from [the MongoDB Node.js driver's `findOneAndUpdate()`](http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#findOneAndUpdate) because it returns the document itself, not a [result object](http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#~findAndModifyWriteOpResult).

As an alternative to the `new` option, you can also use the `returnOriginal` option.
`returnOriginal: false` is equivalent to `new: true`. The `returnOriginal` option
exists for consistency with the [the MongoDB Node.js driver's `findOneAndUpdate()`](http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#findOneAndUpdate),
which has the same option.

```acquit
[require:Tutorial.*findOneAndUpdate.*returnOriginal option]
```

## Atomic Updates

With the exception of an [unindexed upsert](https://www.mongodb.com/docs/manual/reference/method/db.collection.findAndModify/#upsert-with-unique-index), [`findOneAndUpdate()` is atomic](https://www.mongodb.com/docs/manual/core/write-operations-atomicity/#atomicity). That means you can assume the document doesn't change between when MongoDB finds the document and when it updates the document, *unless* you're doing an [upsert](#upsert).

For example, if you're using `save()` to update a document, the document can change in MongoDB in between when you load the document using `findOne()` and when you save the document using `save()` as show below. For many use cases, the `save()` race condition is a non-issue. But you can work around it with `findOneAndUpdate()` (or [transactions](../transactions.html)) if you need to.

```acquit
[require:Tutorial.*findOneAndUpdate.*save race condition]
```

## Upsert

Using the `upsert` option, you can use `findOneAndUpdate()` as a find-and-[upsert](https://www.mongodb.com/docs/manual/reference/method/db.collection.update/#db.collection.update) operation. An upsert behaves like a normal `findOneAndUpdate()` if it finds a document that matches `filter`. But, if no document matches `filter`, MongoDB will insert one by combining `filter` and `update` as shown below.

```acquit
[require:Tutorial.*findOneAndUpdate.*upsert]
```

<h2 id="includeresultmetadata">The <code>includeResultMetadata</code> Option<h2 id="rawresult"></h2></h2>

Mongoose transforms the result of `findOneAndUpdate()` by default: it
returns the updated document. That makes it difficult to check whether
a document was upserted or not. In order to get the updated document
and check whether MongoDB upserted a new document in the same operation,
you can set the `includeResultMetadata` flag to make Mongoose return the raw result
from MongoDB.

```acquit
[require:Tutorial.*findOneAndUpdate.*includeResultMetadata$]
```

Here's what the `res` object from the above example looks like:

```txt
{ lastErrorObject:
   { n: 1,
     updatedExisting: false,
     upserted: 5e6a9e5ec6e44398ae2ac16a },
  value:
   { _id: 5e6a9e5ec6e44398ae2ac16a,
     name: 'Will Riker',
     __v: 0,
     age: 29 },
  ok: 1 }
```

## Updating Discriminator Keys

Mongoose prevents updating the [discriminator key](../discriminators.html#discriminator-keys) using `findOneAndUpdate()` by default.
For example, suppose you have the following discriminator models.

```javascript
const eventSchema = new mongoose.Schema({ time: Date });
const Event = db.model('Event', eventSchema);

const ClickedLinkEvent = Event.discriminator(
  'ClickedLink',
  new mongoose.Schema({ url: String })
);

const SignedUpEvent = Event.discriminator(
  'SignedUp',
  new mongoose.Schema({ username: String })
);
```

Mongoose will remove `__t` (the default discriminator key) from the `update` parameter, if `__t` is set.
This is to prevent unintentional updates to the discriminator key; for example, if you're passing untrusted user input to the `update` parameter.
However, you can tell Mongoose to allow updating the discriminator key by setting the `overwriteDiscriminatorKey` option to `true` as shown below.

```acquit
[require:use overwriteDiscriminatorKey to change discriminator key]
```

<!-- END COPIED CONTENT -->

---

## docs/tutorials/lean.md

Original file: [docs/tutorials/lean.md](../../tutorials/lean.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Faster Mongoose Queries With Lean

The [lean option](../api/query.html#query_Query-lean) tells Mongoose to skip
[hydrating](../api/model.html#model_Model-hydrate) the result documents. This
makes queries faster and less memory intensive, but the result documents are
plain old JavaScript objects (POJOs), **not** [Mongoose documents](../documents.html).
In this tutorial, you'll learn more about the tradeoffs of using `lean()`.

* [Using Lean](#using-lean)
* [Lean and Populate](#lean-and-populate)
* [When to Use Lean](#when-to-use-lean)
* [Plugins](#plugins)
* [BigInts](#bigints)

## Using Lean

By default, Mongoose queries return an instance of the
[Mongoose `Document` class](../api/document.html#Document). Documents are much
heavier than vanilla JavaScript objects, because they have a lot of internal
state for change tracking. Enabling the `lean` option tells Mongoose to skip
instantiating a full Mongoose document and just give you the POJO.

```javascript
const leanDoc = await MyModel.findOne().lean();
```

How much smaller are lean documents? Here's a comparison.

```acquit
[require:Lean Tutorial.*compare sizes]
```

Under the hood, after executing a query, Mongoose converts the query results
from POJOs to Mongoose documents. If you turn on the `lean` option, Mongoose
skips this step.

```acquit
[require:Lean Tutorial.*compare types]
```

The downside of enabling `lean` is that lean docs don't have:

* Change tracking
* Casting and validation
* Getters and setters
* Virtuals
* `save()`

For example, the following code sample shows that the `Person` model's getters
and virtuals don't run if you enable `lean`.

```acquit
[require:Lean Tutorial.*getters and virtuals]
```

## Lean and Populate

[Populate](../populate.html) works with `lean()`. If you
use both `populate()` and `lean()`, the `lean` option propagates to the
populated documents as well. In the below example, both the top-level
'Group' documents and the populated 'Person' documents will be lean.

```acquit
[require:Lean Tutorial.*conventional populate]
```

[Virtual populate](../populate.html#populate-virtuals) also works with lean.

```acquit
[require:Lean Tutorial.*virtual populate]
```

## When to Use Lean

If you're executing a query and sending the results without modification to,
say, an [Express response](http://expressjs.com/en/4x/api.html#res), you should
use lean. In general, if you do not modify the query results and do not use
[custom getters](../api/schematype.html#schematype_SchemaType-get), you should use
`lean()`. If you modify the query results or rely on features like getters
or [transforms](../api/document.html#document_Document-toObject), you should not
use `lean()`.

Below is an example of an [Express route](http://expressjs.com/en/guide/routing.html)
that is a good candidate for `lean()`. This route does not modify the `person`
doc and doesn't rely on any Mongoose-specific functionality.

```javascript
// As long as you don't need any of the Person model's virtuals or getters,
// you can use `lean()`.
app.get('/person/:id', function(req, res) {
  Person.findOne({ _id: req.params.id }).lean().
    then(person => res.json({ person })).
    catch(error => res.json({ error: error.message }));
});
```

Below is an example of an Express route that should **not** use `lean()`. As
a general rule of thumb, `GET` routes are good candidates for `lean()` in a
[RESTful API](https://en.wikipedia.org/wiki/Representational_state_transfer).
On the other hand, `PUT`, `POST`, etc. routes generally should not use `lean()`.

```javascript
// This route should **not** use `lean()`, because lean means no `save()`.
app.put('/person/:id', function(req, res) {
  Person.findOne({ _id: req.params.id }).
    then(person => {
      assert.ok(person);
      Object.assign(person, req.body);
      return person.save();
    }).
    then(person => res.json({ person })).
    catch(error => res.json({ error: error.message }));
});
```

Remember that virtuals do **not** end up in `lean()` query results. Use the
[mongoose-lean-virtuals plugin](http://plugins.mongoosejs.io/plugins/lean-virtuals)
to add virtuals to your lean query results.

## Plugins

Using `lean()` bypasses all Mongoose features, including [virtuals](virtuals.html), [getters/setters](getters-setters.html),
and [defaults](../api/schematype.html#schematype_SchemaType-default). If you want to
use these features with `lean()`, you need to use the corresponding plugin:

* [mongoose-lean-virtuals](https://plugins.mongoosejs.io/plugins/lean-virtuals)
* [mongoose-lean-getters](https://plugins.mongoosejs.io/plugins/lean-getters)
* [mongoose-lean-defaults](https://www.npmjs.com/package/mongoose-lean-defaults)

However, you need to keep in mind that Mongoose does not hydrate lean documents,
so `this` will be a POJO in virtuals, getters, and default functions.

```javascript
const schema = new Schema({ name: String });
schema.plugin(require('mongoose-lean-virtuals'));

schema.virtual('lowercase', function() {
  this instanceof mongoose.Document; // false

  this.name; // Works
  this.get('name'); // Crashes because `this` is not a Mongoose document.
});
```

## BigInts

By default, the MongoDB Node driver converts longs stored in MongoDB into JavaScript numbers, **not** [BigInts](https://thecodebarbarian.com/an-overview-of-bigint-in-node-js.html).
Set the `useBigInt64` option on your `lean()` queries to inflate longs into BigInts.

```acquit
[require:Lean Tutorial.*bigint]
```

<!-- END COPIED CONTENT -->
