# Sources for 09-plugins-transactions-change-streams

This file copies Markdown content from the repo for this chapter. For deeper info, open the original file linked under each section.

---

## docs/plugins.md

Original file: [docs/plugins.md](../../plugins.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Plugins

Schemas are pluggable, that is, they allow for applying pre-packaged capabilities to extend their functionality. This is a very powerful feature.

<ul class="toc">
  <li><a href="#example">Example</a></li>
  <li><a href="#global">Global Plugins</a></li>
  <li><a href="#apply-plugins-before-compiling-models">Apply Plugins Before Compiling Models</a></li>
  <li><a href="#official">Officially Supported Plugins</a></li>
</ul>

## Example {#example}

Plugins are a tool for reusing logic in multiple schemas. Suppose you have
several models in your database and want to add a `loadedAt` property
to each one. Just create a plugin once and apply it to each `Schema`:

```javascript
// loadedAt.js
module.exports = function loadedAtPlugin(schema, options) {
  schema.virtual('loadedAt').
    get(function() { return this._loadedAt; }).
    set(function(v) { this._loadedAt = v; });

  schema.post(['find', 'findOne'], function(docs) {
    if (!Array.isArray(docs)) {
      docs = [docs];
    }
    const now = new Date();
    for (const doc of docs) {
      doc.loadedAt = now;
    }
  });
};

// game-schema.js
const loadedAtPlugin = require('./loadedAt');
const gameSchema = new Schema({ /* ... */ });
gameSchema.plugin(loadedAtPlugin);

// player-schema.js
const loadedAtPlugin = require('./loadedAt');
const playerSchema = new Schema({ /* ... */ });
playerSchema.plugin(loadedAtPlugin);
```

We just added loaded-time behavior to both our `Game` and `Player` schemas and declared an index on the `loadedAt` path of our Games to boot. Not bad for a few lines of code.

## Global Plugins {#global}

Want to register a plugin for all schemas? The mongoose singleton has a
`.plugin()` function that registers a plugin for every schema. For
example:

```javascript
const mongoose = require('mongoose');
mongoose.plugin(require('./loadedAt'));

const gameSchema = new Schema({ /* ... */ });
const playerSchema = new Schema({ /* ... */ });
// `loadedAtPlugin` gets attached to both schemas
const Game = mongoose.model('Game', gameSchema);
const Player = mongoose.model('Player', playerSchema);
```

## Apply Plugins Before Compiling Models {#apply-plugins-before-compiling-models}

Because many plugins rely on [middleware](middleware.html), you should make sure to apply plugins **before**
you call `mongoose.model()` or `conn.model()`. Otherwise, [any middleware the plugin registers won't get applied](middleware.html#defining).

```javascript
// loadedAt.js
module.exports = function loadedAtPlugin(schema, options) {
  schema.virtual('loadedAt').
    get(function() { return this._loadedAt; }).
    set(function(v) { this._loadedAt = v; });

  schema.post(['find', 'findOne'], function(docs) {
    if (!Array.isArray(docs)) {
      docs = [docs];
    }
    const now = new Date();
    for (const doc of docs) {
      doc.loadedAt = now;
    }
  });
};

// game-schema.js
const loadedAtPlugin = require('./loadedAt');
const gameSchema = new Schema({ /* ... */ });
const Game = mongoose.model('Game', gameSchema);

// `find()` and `findOne()` hooks from `loadedAtPlugin()` won't get applied
// because `mongoose.model()` was already called!
gameSchema.plugin(loadedAtPlugin);
```

## Officially Supported Plugins {#official}

The Mongoose team maintains several plugins that add cool new features to
Mongoose. Here's a couple:

* [mongoose-autopopulate](http://plugins.mongoosejs.io/plugins/autopopulate): Always [`populate()`](populate.html) certain fields in your Mongoose schemas.
* [mongoose-lean-virtuals](http://plugins.mongoosejs.io/plugins/lean-virtuals): Attach virtuals to the results of Mongoose queries when using [`.lean()`](api/query.html#query_Query-lean).
* [mongoose-cast-aggregation](https://www.npmjs.com/package/mongoose-cast-aggregation)

You can find a full list of officially supported plugins on [Mongoose's plugins search site](https://plugins.mongoosejs.io/).

## Community

Not only can you re-use schema functionality in your own projects, but you
also reap the benefits of the Mongoose community as well. Any plugin
published to [npm](https://npmjs.org/) and with
'mongoose' as an [npm keyword](https://docs.npmjs.com/files/package.json#keywords)
will show up on our [search results](http://plugins.mongoosejs.io) page.

<!-- END COPIED CONTENT -->

---

## docs/transactions.md

Original file: [docs/transactions.md](../../transactions.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Transactions in Mongoose

[Transactions](https://www.mongodb.com/transactions) let you execute multiple operations in isolation and potentially undo all the operations if one of them fails.
This guide will get you started using transactions with Mongoose.

## Getting Started with Transactions {#getting-started-with-transactions}

If you haven't already, import mongoose:

```javascript
import mongoose from 'mongoose';
```

To create a transaction, you first need to create a session using [`Mongoose#startSession`](api/mongoose.html#mongoose_Mongoose-startSession)
or [`Connection#startSession()`](api/connection.html#connection_Connection-startSession).

```javascript
// Using Mongoose's default connection
const session = await mongoose.startSession();

// Using custom connection
const db = await mongoose.createConnection(mongodbUri).asPromise();
const session = await db.startSession();
```

In practice, you should use either the [`session.withTransaction()` helper](https://mongodb.github.io/node-mongodb-native/3.2/api/ClientSession.html#withTransaction)
or Mongoose's `Connection#transaction()` function to run a transaction. The `session.withTransaction()` helper handles:

* Creating a transaction
* Committing the transaction if it succeeds
* Aborting the transaction if your operation throws
* Retrying in the event of a [transient transaction error](https://stackoverflow.com/questions/52153538/what-is-a-transienttransactionerror-in-mongoose-or-mongodb).

```acquit
[require:transactions.*withTransaction]
```

For more information on the `ClientSession#withTransaction()` function, please see
[the MongoDB Node.js driver docs](https://mongodb.github.io/node-mongodb-native/3.2/api/ClientSession.html#withTransaction).

Mongoose's `Connection#transaction()` function is a wrapper around `withTransaction()` that
integrates Mongoose change tracking with transactions.
For example, suppose you `save()` a document in a transaction that later fails.
The changes in that document are not persisted to MongoDB.
The `Connection#transaction()` function informs Mongoose change tracking that the `save()` was rolled back, and marks all fields that were changed in the transaction as modified.

```javascript
const doc = new Person({ name: 'Will Riker' });

await db.transaction(async function setRank(session) {
  doc.name = 'Captain';
  await doc.save({ session });
  doc.isNew; // false

  // Throw an error to abort the transaction
  throw new Error('Oops!');
}, { readPreference: 'primary' }).catch(() => {});

// true, `transaction()` reset the document's state because the
// transaction was aborted.
doc.isNew;
```

## Note About Parallelism in Transactions {#note-about-parallelism-in-transactions}

Running operations in parallel is **not supported** during a transaction.
The use of `Promise.all`, `Promise.allSettled`, `Promise.race`, etc. to parallelize operations inside a transaction is undefined behaviour and should be avoided.

MongoDB also does not support multiple transactions on the same session in parallel.
This also means MongoDB does not support nested transactions on the same session.
The following code will throw a `Transaction already in progress` error.

```javascript
const doc = new Person({ name: 'Will Riker' });

await db.transaction(async function setRank(session) {
  // This throws `Transaction already in progress` because there is already a transaction
  // in progress for this session.
  await session.withTransaction(async () => {});
});
```

## With Mongoose Documents and `save()` {#with-mongoose-documents-and-save}

If you get a [Mongoose document](documents.html) from [`findOne()`](api/model.html#model_Model-findOne)
or [`find()`](api/model.html#model_Model-find) using a session, the document will
keep a reference to the session and use that session for [`save()`](api/document.html#document_Document-save).

To get/set the session associated with a given document, use [`doc.$session()`](api/document.html#document_Document-$session).

```acquit
[require:transactions.*save]
```

## With the Aggregation Framework {#with-the-aggregation-framework}

The `Model.aggregate()` function also supports transactions. Mongoose
aggregations have a [`session()` helper](api/aggregate.html#aggregate_Aggregate-session)
that sets the [`session` option](api/aggregate.html#aggregate_Aggregate-option).
Below is an example of executing an aggregation within a transaction.

```acquit
[require:transactions.*aggregate]
```

## Using AsyncLocalStorage {#asynclocalstorage}

One major pain point with transactions in Mongoose is that you need to remember to set the `session` option on every operation.
If you don't, your operation will execute outside of the transaction.
Mongoose 8.4 is able to set the `session` operation on all operations within a `Connection.prototype.transaction()` executor function using Node's [AsyncLocalStorage API](https://nodejs.org/api/async_context.html#class-asynclocalstorage).
Set the `transactionAsyncLocalStorage` option using `mongoose.set('transactionAsyncLocalStorage', true)` to enable this feature.

```javascript
mongoose.set('transactionAsyncLocalStorage', true);

const Test = mongoose.model('Test', mongoose.Schema({ name: String }));

const doc = new Test({ name: 'test' });

// Save a new doc in a transaction that aborts
await connection.transaction(async() => {
  await doc.save(); // Notice no session here
  throw new Error('Oops');
}).catch(() => {});

// false, `save()` was rolled back
await Test.exists({ _id: doc._id });
```

With `transactionAsyncLocalStorage`, you no longer need to pass sessions to every operation.
Mongoose will add the session by default under the hood.

`transactionAsyncLocalStorage` creates a new session each time you call `connection.transaction()`.
This means each transaction will have its own session and be independent of other transactions.
This also means that nested transactions are also independent of each other.

```javascript
await mongoose.connection.transaction(async () => {
  await User.create({ name: 'John' });
  // This starts an independent transaction - this transaction will **NOT**
  // be rolled back even though it is within another `transaction()` call
  await mongoose.connection.transaction(async () => {
    await User.create({ name: 'Jane' });
  });
  throw new Error('Fail the top-level transaction');
});
```

However, if the nested transaction fails, the top-level transaction will still be rolled back because `await mongoose.connection.transaction()` throws.

```javascript
await mongoose.connection.transaction(async () => {
  await User.create({ name: 'John' });
  await mongoose.connection.transaction(async () => {
    // This causes both transactions to roll back, but only because this error bubbles up.
    throw new Error('Fail the nested transaction');
  });
});
```

## Advanced Usage {#advanced-usage}

Advanced users who want more fine-grained control over when they commit or abort transactions
can use `session.startTransaction()` to start a transaction:

```acquit
[require:transactions.*basic example]
```

You can also use `session.abortTransaction()` to abort a transaction:

```acquit
[require:transactions.*abort]
```

<!-- END COPIED CONTENT -->

---

## docs/change-streams.md

Original file: [docs/change-streams.md](../../change-streams.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Change Streams

[Change streams](https://www.mongodb.com/developer/languages/javascript/nodejs-change-streams-triggers/) let you listen for updates to documents in a given model's collection, or even documents in an entire database.
Unlike [middleware](middleware.html), change streams are a MongoDB server construct, which means they pick up changes from anywhere.
Even if you update a document from a MongoDB GUI, your Mongoose change stream will be notified.

The `watch()` function creates a change stream.
Change streams emit a `'data'` event when a document is updated.

```javascript
const Person = mongoose.model('Person', new mongoose.Schema({ name: String }));

// Create a change stream. The 'change' event gets emitted when there's a
// change in the database. Print what the change stream emits.
Person.watch().
  on('change', data => console.log(data));

// Insert a doc, will trigger the change stream handler above
await Person.create({ name: 'Axl Rose' });
```

The above script will print output that looks like:

```javascript
{
  _id: {
    _data: '8262408DAC000000012B022C0100296E5A10042890851837DB4792BE6B235E8B85489F46645F6964006462408DAC6F5C42FF5EE087A20004'
  },
  operationType: 'insert',
  clusterTime: new Timestamp({ t: 1648397740, i: 1 }),
  fullDocument: {
    _id: new ObjectId("62408dac6f5c42ff5ee087a2"),
    name: 'Axl Rose',
    __v: 0
  },
  ns: { db: 'test', coll: 'people' },
  documentKey: { _id: new ObjectId("62408dac6f5c42ff5ee087a2") }
}
```

Note that you **must** be connected to a MongoDB replica set or sharded cluster to use change streams.
If you try to call `watch()` when connected to a standalone MongoDB server, you'll get the below error.

```no-highlight
MongoServerError: The $changeStream stage is only supported on replica sets
```

If you're using `watch()` in production, we recommend using [MongoDB Atlas](https://www.mongodb.com/atlas/database).
For local development, we recommend [mongodb-memory-server](https://www.npmjs.com/package/mongodb-memory-server) or [run-rs](https://www.npmjs.com/package/run-rs) to start a replica set locally.

## Iterating using `next()`

If you want to iterate through a change stream in a [AWS Lambda function](lambda.html), do **not** use event emitters to listen to the change stream.
You need to make sure you close your change stream when your Lambda function is done executing, because your change stream may end up in an inconsistent state if Lambda stops your container while the change stream is pulling data from MongoDB.

Change streams also have a `next()` function that lets you explicitly wait for the next change to come in.
Use `resumeAfter` to track where the last change stream left off, and add a timeout to make sure your handler doesn't wait forever if no changes come in.

```javascript
let resumeAfter = undefined;

exports.handler = async(event, context) => {
  // add this so that we can re-use any static/global variables between function calls if Lambda
  // happens to re-use existing containers for the invocation.
  context.callbackWaitsForEmptyEventLoop = false;

  await connectToDatabase();

  const changeStream = await Country.watch([], { resumeAfter });

  // Change stream `next()` will wait forever if there are no changes. So make sure to
  // stop listening to the change stream after a fixed period of time.
  const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(false), 1000));
  let doc = null;
  while (doc = await Promise.race([changeStream.next(), timeoutPromise])) {
    console.log('Got', doc);
  }

  // `resumeToken` tells you where the change stream left off, so next function instance
  // can pick up any changes that happened in the meantime.
  resumeAfter = changeStream.resumeToken;
  await changeStream.close();
};
```

<!-- END COPIED CONTENT -->
