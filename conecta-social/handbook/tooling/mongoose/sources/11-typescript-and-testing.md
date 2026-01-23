# Sources for 11-typescript-and-testing

This file copies Markdown content from the repo for this chapter. For deeper info, open the original file linked under each section.

---

## docs/typescript.md

Original file: [docs/typescript.md](../../typescript.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# TypeScript Support

Mongoose introduced [officially supported TypeScript bindings in v5.11.0](https://thecodebarbarian.com/working-with-mongoose-in-typescript.html).
Mongoose's `index.d.ts` file supports a wide variety of syntaxes and strives to be compatible with `@types/mongoose` where possible.
This guide describes Mongoose's recommended approach to working with Mongoose in TypeScript.

## Creating Your First Document

To get started with Mongoose in TypeScript, you need to:

1. Create a [Schema](guide.html).
2. Create a Model.
3. [Connect to MongoDB](connections.html).

```typescript
import { Schema, model, connect } from 'mongoose';

// 1. Create a Schema corresponding to the document interface.
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  avatar: String
});

// 2. Create a Model.
const User = model('User', userSchema);

run().catch(err => console.log(err));

async function run() {
  // 3. Connect to MongoDB
  await connect('mongodb://127.0.0.1:27017/test');

  const user = new User({
    name: 'Bill',
    email: 'bill@initech.com',
    avatar: 'https://i.imgur.com/dM7Thhn.png'
  });
  await user.save();

  const email: string = user.email;
  console.log(email); // 'bill@initech.com'
}
```

## Using Generics

By default, Mongoose automatically infers the shape of your documents based on your schema definition.
However, if you modify your schema after your `new Schema()` call (like with plugins) then Mongoose's inferred type may be incorrect.
For cases where Mongoose's automatic schema type inference is incorrect, you can define a raw document interface that tells Mongoose the type of documents in your database as follows.

```typescript
import { Schema, model, connect } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
interface IUser {
  name: string;
  email: string;
  avatar?: string;
}

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  avatar: String
});

// 3. Create a Model.
const User = model<IUser>('User', userSchema);

run().catch(err => console.log(err));

async function run() {
  // 4. Connect to MongoDB
  await connect('mongodb://127.0.0.1:27017/test');

  const user = new User({
    name: 'Bill',
    email: 'bill@initech.com',
    avatar: 'https://i.imgur.com/dM7Thhn.png'
  });
  await user.save();

  console.log(user.email); // 'bill@initech.com'
}
```

You as the developer are responsible for ensuring that your document interface lines up with your Mongoose schema.
For example, Mongoose won't report an error if `email` is `required` in your Mongoose schema but optional in your document interface.

The `User()` constructor returns an instance of `HydratedDocument<IUser>`.
`IUser` is a *document interface*, it represents the raw object structure that `IUser` objects look like in MongoDB.
`HydratedDocument<IUser>` represents a hydrated Mongoose document, with methods, virtuals, and other Mongoose-specific features.

```ts
import { HydratedDocument } from 'mongoose';

const user: HydratedDocument<IUser> = new User({
  name: 'Bill',
  email: 'bill@initech.com',
  avatar: 'https://i.imgur.com/dM7Thhn.png'
});
```

To define a property of type `ObjectId`, you should use `Types.ObjectId` in the TypeScript document interface. You should use `'ObjectId'` or `Schema.Types.ObjectId` in your schema definition.

```ts
import { Schema, Types } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
interface IUser {
  name: string;
  email: string;
  // Use `Types.ObjectId` in document interface...
  organization: Types.ObjectId;
}

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  // And `Schema.Types.ObjectId` in the schema definition.
  organization: { type: Schema.Types.ObjectId, ref: 'Organization' }
});
```

That's because `Schema.Types.ObjectId` is a [class that inherits from SchemaType](schematypes.html), **not** the class you use to create a new MongoDB ObjectId.

## Using Custom Bindings

If Mongoose's built-in `index.d.ts` file does not work for you, you can remove it in a postinstall script in your `package.json` as shown below.
However, before you do, please [open an issue on Mongoose's GitHub page](https://github.com/Automattic/mongoose/issues/new) and describe the issue you're experiencing.

```json
{
  "postinstall": "rm ./node_modules/mongoose/index.d.ts"
}
```

## Next Up

Now that you've seen the basics of how to use Mongoose in TypeScript, let's take a look at [methods in TypeScript](typescript/statics-and-methods.html).

<!-- END COPIED CONTENT -->

---

## docs/jest.md

Original file: [docs/jest.md](../../jest.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Testing Mongoose with [Jest](https://www.npmjs.com/package/jest)

Jest is a JavaScript runtime developed by Facebook that is usually used for testing.
Because Jest is designed primarily for testing React applications, using it to test Node.js server-side applications comes with a lot of caveats.
We strongly recommend using a different testing framework, like [Mocha](https://mochajs.org/).

To suppress any Jest warnings from Mongoose, set the `SUPPRESS_JEST_WARNINGS` environment variable:

```sh
env SUPPRESS_JEST_WARNINGS=1 npm test
```

If you choose to delve into dangerous waters and test Mongoose apps with Jest, here's what you need to know:

## Recommended `testEnvironment` {#recommended-testenvironment}

If you are using Jest `<=26`, do **not** use Jest's default [`jsdom` test environment](https://jestjs.io/docs/en/configuration.html#testenvironment-string) when testing Mongoose apps, *unless* you are explicitly testing an application that only uses [Mongoose's browser library](browser.html). In Jest `>=27`, ["node" is Jest's default `testEnvironment`](https://jestjs.io/ro/blog/2021/05/25/jest-27#flipping-defaults), so this is no longer an issue.

The `jsdom` test environment attempts to create a browser-like test
environment in Node.js, and it comes with numerous nasty surprises like a
[stubbed `setTimeout()` function](https://github.com/jsdom/jsdom/commit/3f306bea5362aceb2a219a2e98ff96a7464d2f19#commitcomment-31316213)
that silently fails after tests are finished. Mongoose does not support jsdom
in general and is not expected to function correctly in the `jsdom` test
environment.

To change your `testEnvironment` to Node.js, add `testEnvironment` to your
`jest.config.js` file:

```javascript
module.exports = {
  testEnvironment: 'node'
};
```

## Timer Mocks {#timer-mocks}

Absolutely do **not** use [timer mocks](https://jestjs.io/docs/en/timer-mocks.html) when testing Mongoose apps.
This is especially important if you're using Jest `>=25`, which stubs out `process.nextTick()`.

Fake timers stub out global functions like `setTimeout()` and `setInterval()`, which causes problems when an underlying library uses these functions.
Mongoose and the MongoDB Node.js driver uses these functions for deferring work until the next tick of the event loop and for monitoring connections to the MongoDB server.

If you absolutely must use timer mocks, make sure you import Mongoose **before** calling `useFakeTimers()`:

```javascript
// Fine for basic cases, but may still cause issues:
const mongoose = require('mongoose');

jest.useFakeTimers();

// Bad:
jest.useFakeTimers();

const mongoose = require('mongoose');
```

Mongoose devs have already refactored out code to [avoid using `setImmediate()`](https://github.com/Automattic/mongoose/issues/6074) to defer work to the next tick of the event loop, but we can't reasonably ensure that every library Mongoose depends on doesn't use `setImmediate()`.

A better alternative is to create your own wrapper around `setTimeout()` and
stub that instead using [sinon](http://npmjs.com/package/sinon).

```javascript
// time.js
exports.setTimeout = function() {
  return global.setTimeout.apply(global, arguments);
};

// Tests
const time = require('../util/time');
const sinon = require('sinon');
sinon.stub(time, 'setTimeout');
```

## `globalSetup` and `globalTeardown` {#globalsetup-and-globalteardown}

Do **not** use `globalSetup` to call `mongoose.connect()` or
`mongoose.createConnection()`. Jest runs `globalSetup` in
a [separate environment](https://github.com/facebook/jest/issues/7184),
so you cannot use any connections you create in `globalSetup`
in your tests.

## resetModules

We recommend setting `resetModules` to `false` in your Jest config.
[`resetModules: true` can cause issues with internal `instanceof` checks](https://github.com/Automattic/mongoose/issues/15499) by creating multiple dangling copies of the Mongoose module.

## Further Reading

Want to learn how to test Mongoose apps correctly? The
[RESTful Web Services with Node.js and Express](https://pluralsight.pxf.io/c/1321469/424552/7490?u=https%3A%2F%2Fapp.pluralsight.com%2Flibrary%2Fcourses%2Fnode-js-express-rest-web-services%2Ftable-of-contents)
course on Pluralsight has a great section on testing Mongoose apps with [Mocha](http://npmjs.com/package/mocha).

<a href="https://pluralsight.pxf.io/c/1321469/424552/7490?u=https%3A%2F%2Fapp.pluralsight.com%2Flibrary%2Fcourses%2Fnode-js-express-rest-web-services%2Ftable-of-contents">
  <img src="https://i.imgur.com/KouuaAZ.png" alt="RESTful Web Services with Node.js and Express">
</a>

<!-- END COPIED CONTENT -->

---

## docs/typescript/virtuals.md

Original file: [docs/typescript/virtuals.md](../../typescript/virtuals.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Virtuals in TypeScript

[Virtuals](../tutorials/virtuals.html) are computed properties: you can access virtuals on hydrated Mongoose documents, but virtuals are **not** stored in MongoDB.
Mongoose supports auto typed virtuals so you don't need to define additional typescript interface anymore but you are still able to do so.

## Automatically Inferred Types

To make mongoose able to infer virtuals type, You have to define them in schema constructor as following:

```ts
import { Schema, Model, model } from 'mongoose';

const schema = new Schema(
  {
    firstName: String,
    lastName: String
  },
  {
    virtuals: {
      fullName: {
        get() {
          return `${this.firstName} ${this.lastName}`;
        }
        // virtual setter and options can be defined here as well.
      }
    }
  }
);
```

If you are using automatic schema inference, you should define virtuals using the `virtuals` option in the schema constructor as shown above.
Mongoose will not automatically infer any virtuals you define using `Schema.prototype.virtual()`.

Note that Mongoose does **not** include virtuals in the returned type from `InferSchemaType`.
That is because `InferSchemaType` returns a value similar to the raw document interface, which represents the structure of the data stored in MongoDB.

```ts
type User = InferSchemaType<typeof schema>;

const user: User = {};
// Property 'fullName' does not exist on type '{ firstName?: string | undefined; ... }'.
user.fullName;
```

However, Mongoose **does** add the virtuals to the model type.

```ts
const UserModel = model('User', schema);

const user = new UserModel({ firstName: 'foo' });
// Works
user.fullName;

// Here's how to get the hydrated document type
type UserDocument = ReturnType<(typeof UserModel)['hydrate']>;
```

## Set virtuals type manually

You shouldn't define virtuals in your TypeScript [document interface](../typescript.html).
Instead, you should define a separate interface for your virtuals, and pass this interface to `Model` and `Schema`.

For example, suppose you have a `UserDoc` interface, and you want to define a `fullName` virtual.
Below is how you can define a separate `UserVirtuals` interface for `fullName`.

```ts
import { Schema, Model, model } from 'mongoose';

interface UserDoc {
  firstName: string;
  lastName: string;
}

interface UserVirtuals {
  fullName: string;
}

type UserModelType = Model<UserDoc, {}, {}, UserVirtuals>; // <-- add virtuals here...

const schema = new Schema<UserDoc, UserModelType, {}, {}, UserVirtuals>({ // <-- and here
  firstName: String,
  lastName: String
});

schema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});
```

If you explicitly define the `UserVirtuals` interface, you should define your virtuals using `schema.virtual()` as shown above.
We recommend `schema.virtual()` over the `virtuals` option to the Schema constructor shown in the Automatically Inferred Types section above because the `virtuals` option won't allow you to access other virtuals on `this`.

## Override the Type of `this` in Your Virtual

In case the value of `this` in your virtual is incorrect for some reason, you can always override it using the generic parameter in the `virtual()` function.

```ts
interface MyCustomUserDocumentType {
  firstName: string;
  lastName: string;
  myMethod(): string;
}

schema.virtual<MyCustomUserDocumentType>('fullName').get(function() {
  return this.method(); // returns string
});
```

<!-- END COPIED CONTENT -->

---

## docs/typescript/subdocuments.md

Original file: [docs/typescript/subdocuments.md](../../typescript/subdocuments.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Handling Subdocuments in TypeScript

Subdocuments are tricky in TypeScript.
By default, Mongoose treats object properties in document interfaces as *nested properties* rather than subdocuments.

```ts
// Setup
import { Schema, Types, model, Model } from 'mongoose';

// Subdocument definition
interface Names {
  _id: Types.ObjectId;
  firstName: string;
}

// Document definition
interface User {
  names: Names;
}

// Models and schemas
type UserModelType = Model<User>;
const userSchema = new Schema<User, UserModelType>({
  names: new Schema<Names>({ firstName: String })
});
const UserModel = model<User, UserModelType>('User', userSchema);

// Create a new document:
const doc = new UserModel({ names: { _id: '0'.repeat(24), firstName: 'foo' } });

// "Property 'ownerDocument' does not exist on type 'Names'."
// Means that `doc.names` is not a subdocument!
doc.names.ownerDocument();
```

Mongoose provides a mechanism to override types in the hydrated document.
Define a separate `THydratedDocumentType` and pass it as the 5th generic param to `mongoose.Model<>`.
`THydratedDocumentType` controls what type Mongoose uses for "hydrated documents", that is, what `await UserModel.findOne()`, `UserModel.hydrate()`, and `new UserModel()` return.

```ts
import { HydratedSingleSubdocument } from 'mongoose';

// Define property overrides for hydrated documents
type THydratedUserDocument = {
  names?: HydratedSingleSubdocument<Names>
}
type UserModelType = mongoose.Model<User, {}, {}, {}, THydratedUserDocument>;

const userSchema = new mongoose.Schema<User, UserModelType>({
  names: new mongoose.Schema<Names>({ firstName: String })
});
const UserModel = mongoose.model<User, UserModelType>('User', userSchema);

const doc = new UserModel({ names: { _id: '0'.repeat(24), firstName: 'foo' } });
doc.names!.ownerDocument(); // Works, `names` is a subdocument!
doc.names!.firstName; // 'foo'
```

## Subdocument Arrays

You can also override arrays to properly type subdocument arrays using `TMethodsAndOverrides`:

```ts
// Subdocument definition
interface Names {
  _id: Types.ObjectId;
  firstName: string;
}
// Document definition
interface User {
  names: Names[];
}

// TMethodsAndOverrides
type THydratedUserDocument = {
  names?: Types.DocumentArray<Names>
}
type UserModelType = Model<User, {}, {}, {}, THydratedUserDocument>;

// Create model
const UserModel = model<User, UserModelType>('User', new Schema<User, UserModelType>({
  names: [new Schema<Names>({ firstName: String })]
}));

const doc = new UserModel({});
doc.names[0].ownerDocument(); // Works!
doc.names[0].firstName; // string
```

<!-- END COPIED CONTENT -->

---

## docs/typescript/schemas.md

Original file: [docs/typescript/schemas.md](../../typescript/schemas.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Schemas in TypeScript

Mongoose [schemas](../guide.html) are how you tell Mongoose what your documents look like.
Mongoose schemas are separate from TypeScript interfaces, so you need to either define both a *raw document interface* and a *schema*; or rely on Mongoose to automatically infer the type from the schema definition.

## Automatic type inference

Mongoose can automatically infer the document type from your schema definition as follows.
We recommend relying on automatic type inference when defining schemas and models.

```typescript
import { Schema, model } from 'mongoose';
// Schema
const schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  avatar: String
});

// `UserModel` will have `name: string`, etc.
const UserModel = mongoose.model('User', schema);

const doc = new UserModel({ name: 'test', email: 'test' });
doc.name; // string
doc.email; // string
doc.avatar; // string | undefined | null
```

There are a few caveats for using automatic type inference:

1. You need to set `strictNullChecks: true` or `strict: true` in your `tsconfig.json`. Or, if you're setting flags at the command line, `--strictNullChecks` or `--strict`. There are [known issues](https://github.com/Automattic/mongoose/issues/12420) with automatic type inference with strict mode disabled.
2. You need to define your schema in the `new Schema()` call. Don't assign your schema definition to a temporary variable. Doing something like `const schemaDefinition = { name: String }; const schema = new Schema(schemaDefinition);` will not work.
3. Mongoose adds `createdAt` and `updatedAt` to your schema if you specify the `timestamps` option in your schema.

If you must define your schema separately, use [as const](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) (`const schemaDefinition = { ... } as const;`) to prevent *type widening*. TypeScript will automatically widen types like `required: false` to `required: boolean`, which will cause Mongoose to assume the field is required. Using `as const` forces TypeScript to retain these types.

If you need to explicitly get the raw document type (the value returned from `doc.toObject()`, `await Model.findOne().lean()`, etc.) from your schema definition, you can use Mongoose's `inferRawDocType` helper as follows:

```ts
import { Schema, InferRawDocType, model } from 'mongoose';

const schemaDefinition = {
  name: { type: String, required: true },
  email: { type: String, required: true },
  avatar: String
} as const;
const schema = new Schema(schemaDefinition);

const UserModel = model('User', schema);
const doc = new UserModel({ name: 'test', email: 'test' });

type RawUserDocument = InferRawDocType<typeof schemaDefinition>;

useRawDoc(doc.toObject());

function useRawDoc(doc: RawUserDocument) {
  // ...
}

```

If automatic type inference doesn't work for you, you can always fall back to document interface definitions.

## Separate document interface definition

If automatic type inference doesn't work for you, you can define a separate raw document interface as follows.

```typescript
import { Schema } from 'mongoose';

// Raw document interface. Contains the data type as it will be stored
// in MongoDB. So you can ObjectId, Buffer, and other custom primitive data types.
// But no Mongoose document arrays or subdocuments.
interface User {
  name: string;
  email: string;
  avatar?: string;
}

// Schema
const schema = new Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  avatar: String
});
```

By default, Mongoose does **not** check if your raw document interface lines up with your schema.
For example, the above code won't throw an error if `email` is optional in the document interface, but `required` in `schema`.

## Generic parameters

The Mongoose `Schema` class in TypeScript has 9 [generic parameters](https://www.typescriptlang.org/docs/handbook/2/generics.html):

* `RawDocType` - An interface describing how the data is saved in MongoDB
* `TModelType` - The Mongoose model type. Can be omitted if there are no query helpers or instance methods to be defined.
  * default: `Model<DocType, any, any>`
* `TInstanceMethods` - An interface containing the methods for the schema.
  * default: `{}`
* `TQueryHelpers` - An interface containing query helpers defined on the schema. Defaults to `{}`.
* `TVirtuals` - An interface containing virtuals defined on the schema. Defaults to `{}`
* `TStaticMethods` - An interface containing methods on a model. Defaults to `{}`
* `TSchemaOptions` - The type passed as the 2nd option to `Schema()` constructor. Defaults to `DefaultSchemaOptions`.
* `DocType` - The inferred document type from the schema.
* `THydratedDocumentType` - The hydrated document type. This is the default return type for `await Model.findOne()`, `Model.hydrate()`, etc.

<details>
  <summary>View TypeScript definition</summary>

  ```typescript
  export class Schema<
    RawDocType = any,
    TModelType = Model<RawDocType, any, any, any>,
    TInstanceMethods = {},
    TQueryHelpers = {},
    TVirtuals = {},
    TStaticMethods = {},
    TSchemaOptions = DefaultSchemaOptions,
    DocType = ...,
    THydratedDocumentType = HydratedDocument<FlatRecord<DocType>, TVirtuals & TInstanceMethods>
  >
    extends events.EventEmitter {
    // ...
  }
  ```
  
</details>

The first generic param, `DocType`, represents the type of documents that Mongoose will store in MongoDB.
Mongoose wraps `DocType` in a Mongoose document for cases like the `this` parameter to document middleware.
For example:

```typescript
schema.pre('save', function(): void {
  console.log(this.name); // TypeScript knows that `this` is a `mongoose.Document & User` by default
});
```

The second generic param, `M`, is the model used with the schema. Mongoose uses the `M` type in model middleware defined in the schema.

The third generic param, `TInstanceMethods` is used to add types for instance methods defined in the schema.

The 4th param, `TQueryHelpers`, is used to add types for [chainable query helpers](query-helpers.html).

## Schema vs Interface fields

Mongoose checks to make sure that every path in your schema is defined in your document interface.

For example, the below code will fail to compile because `email` is a path in the schema, but not in the `DocType` interface.

```typescript
import { Schema, Model } from 'mongoose';

interface User {
  name: string;
  email: string;
  avatar?: string;
}

// Object literal may only specify known properties, but 'emaill' does not exist in type ...
// Did you mean to write 'email'?
const schema = new Schema<User>({
  name: { type: String, required: true },
  emaill: { type: String, required: true },
  avatar: String
});
```

However, Mongoose does **not** check for paths that exist in the document interface, but not in the schema.
For example, the below code compiles.

```typescript
import { Schema, Model } from 'mongoose';

interface User {
  name: string;
  email: string;
  avatar?: string;
  createdAt: number;
}

const schema = new Schema<User, Model<User>>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  avatar: String
});
```

This is because Mongoose has numerous features that add paths to your schema that should be included in the `DocType` interface without you explicitly putting these paths in the `Schema()` constructor. For example, [timestamps](https://masteringjs.io/tutorials/mongoose/timestamps) and [plugins](../plugins.html).

## Arrays

When you define an array in a document interface, we recommend using vanilla JavaScript arrays, **not** Mongoose's `Types.Array` type or `Types.DocumentArray` type.
Instead, use the `THydratedDocumentType` generic for models and schemas to define that the hydrated document type has paths of type `Types.Array` and `Types.DocumentArray`.

```typescript
import mongoose from 'mongoose'
const { Schema } = mongoose;

interface IOrder {
  tags: Array<{ name: string }>
}

// Define a HydratedDocumentType that describes what type Mongoose should use
// for fully hydrated docs returned from `findOne()`, etc.
type OrderHydratedDocument = mongoose.HydratedDocument<
  IOrder,
  { tags: mongoose.HydratedArraySubdocument<{ name: string }> }
>;
type OrderModelType = mongoose.Model<
  IOrder,
  {},
  {},
  {},
  OrderHydratedDocument // THydratedDocumentType
>;

const orderSchema = new mongoose.Schema<
  IOrder,
  OrderModelType,
  {}, // methods
  {}, // query helpers
  {}, // virtuals
  {}, // statics
  mongoose.DefaultSchemaOptions, // schema options
  IOrder, // doctype
  OrderHydratedDocument // THydratedDocumentType
>({
  tags: [{ name: { type: String, required: true } }]
});
const OrderModel = mongoose.model<IOrder, OrderModelType>('Order', orderSchema);

// Demonstrating return types from OrderModel
const doc = new OrderModel({ tags: [{ name: 'test' }] });

doc.tags; // mongoose.Types.DocumentArray<{ name: string }>
doc.toObject().tags; // Array<{ name: string }>

async function run() {
  const docFromDb = await OrderModel.findOne().orFail();
  docFromDb.tags; // mongoose.Types.DocumentArray<{ name: string }>

  const leanDoc = await OrderModel.findOne().orFail().lean();
  leanDoc.tags; // Array<{ name: string }>
};
```

Use `HydratedArraySubdocument<RawDocType>` for the type of array subdocuments, and `HydratedSingleSubdocument<RawDocType>` for single subdocuments.

If you are not using [schema methods](../guide.html#methods), middleware, or [virtuals](../tutorials/virtuals.html), you can omit the last 7 generic parameters to `Schema()` and just define your schema using  `new mongoose.Schema<IOrder, OrderModelType>(...)`.
The THydratedDocumentType parameter for schemas is primarily for setting the value of `this` on methods and virtuals.

<!-- END COPIED CONTENT -->

---

## docs/typescript/queries.md

Original file: [docs/typescript/queries.md](../../typescript/queries.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Queries in TypeScript

Mongoose's [Query class](../api/query.html) is a chainable query builder that represents a MongoDB query.
When you call `find()`, `findOne()`, `updateOne()`, `findOneAndUpdate()`, etc. on a model, Mongoose will return a Query instance.
Queries have a `.then()` function that returns a Promise, so you can use them with `await`.

In TypeScript, the Query class takes the following generic parameters:

```ts
class Query<
  ResultType, // The type of the result of the query, like `DocType[]`
  DocType, // The hydrated document type of the query's associated model
  THelpers = {}, // Query helpers
  RawDocType = unknown, // The "lean" document type of the query's associated model
  QueryOp = 'find', // The operation that will be executed, like 'find', 'findOne', 'updateOne', etc.
  TDocOverrides = Record<string, never> // Methods and virtuals on the hydrated document
>
```

## Using `lean()` in TypeScript

The [`lean()` method](../tutorials/lean.html) tells Mongoose to skip [hydrating](../api/model.html#model_Model-hydrate) the result documents, making queries faster and more memory efficient.
`lean()` comes with some caveats in TypeScript when working with the query `transform()` function.
In general, we recommend calling `lean()` before using the `transform()` function to ensure accurate types.

```ts
// Put `lean()` **before** `transform()` in TypeScript because `transform` modifies the query ResultType into a shape
// that `lean()` does not know how to handle.
const result = await ProjectModel
  .find()
  .lean()
  .transform((docs) => new Map(docs.map((doc) => [doc._id.toString(), doc])));

// Do **not** do the following
const result = await ProjectModel
  .find()
  .transform((docs) => new Map(docs.map((doc) => [doc._id.toString(), doc])))
  .lean();
```

In general, if you're having trouble with `lean()` inferring the correct type, you can try moving `lean()` earlier in the query chain.

<!-- END COPIED CONTENT -->

---

## docs/typescript/statics-and-methods.md

Original file: [docs/typescript/statics-and-methods.md](../../typescript/statics-and-methods.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Statics in TypeScript

To use Mongoose's automatic type inference to define types for your [statics](../guide.html#statics) and [methods](../guide.html#methods), you should define your methods and statics using the `methods` and `statics` schema options as follows.
Do **not** use the `Schema.prototype.method()` and `Schema.prototype.static()` functions, because Mongoose's automatic type inference system cannot detect methods and statics defined using those functions.

```typescript
const userSchema = new mongoose.Schema(
  { name: { type: String, required: true } },
  {
    methods: {
      updateName(name: string) {
        this.name = name;
        return this.save();
      }
    },
    statics: {
      createWithName(name: string) {
        return this.create({ name });
      }
    }
  }
);
const UserModel = mongoose.model('User', userSchema);

const doc = new UserModel({ name: 'test' });
// Compiles correctly
doc.updateName('foo');
// Compiles correctly
UserModel.createWithName('bar');
```

## With Generics

We recommend using Mongoose's automatic type inference where possible, but you can use `Schema` and `Model` generics to set up type inference for your statics and methods.
Mongoose [models](../models.html) do **not** have an explicit generic parameter for [statics](../guide.html#statics).
If your model has statics, we recommend creating an interface that [extends](https://www.typescriptlang.org/docs/handbook/interfaces.html) Mongoose's `Model` interface as shown below.

```typescript
import { Model, Schema, model } from 'mongoose';

interface IUser {
  name: string;
}

interface UserModelType extends Model<IUser> {
  myStaticMethod(): number;
}

const schema = new Schema<IUser, UserModelType>({ name: String });
schema.static('myStaticMethod', function myStaticMethod() {
  return 42;
});

const User = model<IUser, UserModelType>('User', schema);

const answer: number = User.myStaticMethod(); // 42
```

You should pass methods as the 3rd generic param to the `Schema` constructor as follows.

```typescript
import { Model, Schema, model } from 'mongoose';

interface IUser {
  name: string;
}

interface UserMethods {
  updateName(name: string): Promise<any>;
}

const schema = new Schema<IUser, Model<IUser>, UserMethods>({ name: String });
schema.method('updateName', function updateName(name) {
  this.name = name;
  return this.save();
});

const User = model('User', schema);
const doc = new User({ name: 'test' });
// Compiles correctly
doc.updateName('foo');
```

## Using `loadClass()` with TypeScript

Mongoose supports applying ES6 classes to a schema using [`schema.loadClass()`](../api/schema.html#Schema.prototype.loadClass()) as an alternative to defining statics and methods in your schema.
When using TypeScript, there are a few important typing details to understand.

### Basic Usage

`loadClass()` copies static methods, instance methods, and ES getters/setters from the class onto the schema.

```ts
class MyClass {
  myMethod() {
    return 42;
  }

  static myStatic() {
    return 42;
  }

  get myVirtual() {
    return 42;
  }
}

const schema = new Schema({ property1: String });
schema.loadClass(MyClass);
```

Mongoose does not automatically update TypeScript types for class members. To get full type support, you must manually define types using Mongoose's [Model](../api/model.html) and [HydratedDocument](../typescript.html) generics.

```ts
// 1. Define an interface for the raw document data
interface RawDocType {
  property1: string;
}

// 2. Define the Model type
// This includes the raw data, query helpers, instance methods, virtuals, and statics.
type MyCombinedModel = Model<
  RawDocType, 
  {}, 
  Pick<MyClass, 'myMethod'>, 
  Pick<MyClass, 'myVirtual'> 
> & Pick<typeof MyClass, 'myStatic'>; 

// 3. Define the Document type
type MyCombinedDocument = HydratedDocument<
  RawDocType,
  Pick<MyClass, 'myMethod'>, 
  {}, 
  Pick<MyClass, 'myVirtual'> 
>;

// 4. Create the Mongoose model
const MyModel = model<RawDocType, MyCombinedModel>(
  'MyClass',
  schema
);

MyModel.myStatic();
const doc = new MyModel();
doc.myMethod();
doc.myVirtual;
doc.property1;     
```

### Typing `this` Inside Methods

You can annotate `this` in methods to enable full safety, using the [Model](../api/model.html) and [HydratedDocument](../typescript.html) types you defined.
Note that this must be done for **each method individually**; it is not possible to set a `this` type for the entire class at once.

```ts
class MyClass {
  // Instance method typed with correct `this` type
  myMethod(this: MyCombinedDocument) {
    return this.property1;
  }

  // Static method typed with correct `this` type
  static myStatic(this: MyCombinedModel) {
    return 42;
  }
}
```

### Getters / Setters Limitation

TypeScript currently does **not** allow `this` parameters on getters/setters:

```ts
class MyClass {
  // error TS2784: 'this' parameters are not allowed in getters
  get myVirtual(this: MyCombinedDocument) {
    return this.property1;
  }
}
```

This is a TypeScript limitation. See: [TypeScript issue #52923](https://github.com/microsoft/TypeScript/issues/52923)

As a workaround, you can cast `this` to the document type inside your getter:

```ts
get myVirtual() {
  // Workaround: cast 'this' to your document type
  const self = this as MyCombinedDocument;
  return `Name: ${self.property1}`;
}
```

### Full Example Code

```ts
import { Model, Schema, model, HydratedDocument } from 'mongoose';

interface RawDocType {
  property1: string;
}

class MyClass {
  myMethod(this: MyCombinedDocument) {
    return this.property1;
  }

  static myStatic(this: MyCombinedModel) {
    return 42;
  }

  get myVirtual() {
    const self = this as MyCombinedDocument;
    return `Hello ${self.property1}`;
  }
}

const schema = new Schema<RawDocType>({ property1: String });
schema.loadClass(MyClass);

type MyCombinedModel = Model<
  RawDocType,
  {},
  Pick<MyClass, 'myMethod'>,
  Pick<MyClass, 'myVirtual'>
> & Pick<typeof MyClass, 'myStatic'>;

type MyCombinedDocument = HydratedDocument<
  RawDocType,
  Pick<MyClass, 'myMethod'>,
  {},
  Pick<MyClass, 'myVirtual'>
>;

const MyModel = model<RawDocType, MyCombinedModel>(
  'MyClass',
  schema
);

const doc = new MyModel({ property1: 'world' });
doc.myMethod(); 
MyModel.myStatic(); 
console.log(doc.myVirtual); 
```

### When Should I Use `loadClass()`?

`loadClass()` is useful for defining methods and statics in classes.
If you have a strong preference for classes, you can use `loadClass()`; however, we recommend defining `statics` and `methods` in schema options as described in the first section.

The major downside of `loadClass()` in TypeScript is that it requires manual TypeScript types.
If you want better type inference, you can use schema options [`methods`](../guide.html#methods) and [`statics`](../guide.html#statics).

<!-- END COPIED CONTENT -->

---

## docs/typescript/populate.md

Original file: [docs/typescript/populate.md](../../typescript/populate.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Populate with TypeScript

[Mongoose's TypeScript bindings](https://thecodebarbarian.com/working-with-mongoose-in-typescript.html) add a generic parameter `Paths` to the `populate()`:

```typescript
import { Schema, model, Document, Types } from 'mongoose';

// `Parent` represents the object as it is stored in MongoDB
interface Parent {
  child?: Types.ObjectId,
  name?: string
}
const ParentModel = model<Parent>('Parent', new Schema({
  child: { type: Schema.Types.ObjectId, ref: 'Child' },
  name: String
}));

interface Child {
  name: string;
}
const childSchema = new Schema({ name: String });
const ChildModel = model<Child>('Child', childSchema);

// Populate with `Paths` generic `{ child: Child }` to override `child` path
ParentModel.findOne({}).populate<{ child: Child }>('child').orFail().then(doc => {
  // Works
  const t: string = doc.child.name;
});
```

An alternative approach is to define a `PopulatedParent` interface and use `Pick<>` to pull the properties you're populating.

```ts
import { Schema, model, Document, Types } from 'mongoose';

// `Parent` represents the object as it is stored in MongoDB
interface Parent {
  child?: Types.ObjectId,
  name?: string
}
interface Child {
  name: string;
}
interface PopulatedParent {
  child: Child | null;
}
const ParentModel = model<Parent>('Parent', new Schema({
  child: { type: Schema.Types.ObjectId, ref: 'Child' },
  name: String
}));
const childSchema = new Schema({ name: String });
const ChildModel = model<Child>('Child', childSchema);

// Populate with `Paths` generic `{ child: Child }` to override `child` path
ParentModel.findOne({}).populate<Pick<PopulatedParent, 'child'>>('child').orFail().then(doc => {
  // Works
  const t: string = doc.child.name;
});
```

## Using `PopulatedDoc`

Mongoose also exports a `PopulatedDoc` type that helps you define populated documents in your document interface:

```ts
import { Schema, model, Document, PopulatedDoc } from 'mongoose';

// `child` is either an ObjectId or a populated document
interface Parent {
  child?: PopulatedDoc<Document<ObjectId> & Child>,
  name?: string
}
const ParentModel = model<Parent>('Parent', new Schema({
  child: { type: 'ObjectId', ref: 'Child' },
  name: String
}));

interface Child {
  name?: string;
}
const childSchema = new Schema({ name: String });
const ChildModel = model<Child>('Child', childSchema);

ParentModel.findOne({}).populate('child').orFail().then((doc: Parent) => {
  const child = doc.child;
  if (child == null || child instanceof ObjectId) {
    throw new Error('should be populated');
  } else {
    // Works
    doc.child.name.trim();
  }
});
```

However, we recommend using the `.populate<{ child: Child }>` syntax from the first section instead of `PopulatedDoc`.
Here's two reasons why:

1. You still need to add an extra check to check if `child instanceof ObjectId`. Otherwise, the TypeScript compiler will fail with `Property name does not exist on type ObjectId`. So using `PopulatedDoc<>` means you need an extra check everywhere you use `doc.child`.
2. In the `Parent` interface, `child` is a hydrated document, which makes it difficult for Mongoose to infer the type of `child` when you use `lean()` or `toObject()`.

<!-- END COPIED CONTENT -->

---

## docs/typescript/query-helpers.md

Original file: [docs/typescript/query-helpers.md](../../typescript/query-helpers.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Query Helpers in TypeScript

[Query helpers](http://thecodebarbarian.com/mongoose-custom-query-methods.html) let you define custom helper methods on Mongoose queries.
Query helpers make queries more semantic using chaining syntax.

The following is an example of how query helpers work in JavaScript.

```javascript
ProjectSchema.query.byName = function(name) {
  return this.find({ name: name });
};
const Project = mongoose.model('Project', ProjectSchema);

// Works. Any Project query, whether it be `find()`, `findOne()`,
// `findOneAndUpdate()`, `delete()`, etc. now has a `byName()` helper
Project.find().where('stars').gt(1000).byName('mongoose');
```

## Manually Typed Query Helpers

In TypeScript, you can define query helpers using a separate query helpers interface.
Mongoose's `Model` takes 3 generic parameters:

1. The `DocType`
2. a `TQueryHelpers` type
3. a `TMethods` type

The 2nd generic parameter, `TQueryHelpers`, should be an interface that contains a function signature for each of your query helpers.
Below is an example of creating a `ProjectModel` with a `byName` query helper.

```typescript
import { HydratedDocument, Model, QueryWithHelpers, Schema, model, connect } from 'mongoose';

interface Project {
  name?: string;
  stars?: number;
}

interface ProjectQueryHelpers {
  byName(name: string): QueryWithHelpers<
    HydratedDocument<Project>[],
    HydratedDocument<Project>,
    ProjectQueryHelpers
  >
}

type ProjectModelType = Model<Project, ProjectQueryHelpers>;

const ProjectSchema = new Schema<
  Project,
  Model<Project, ProjectQueryHelpers>,
  {},
  ProjectQueryHelpers
>({
  name: String,
  stars: Number
});

ProjectSchema.query.byName = function byName(
  this: QueryWithHelpers<any, HydratedDocument<Project>, ProjectQueryHelpers>,
  name: string
) {
  return this.find({ name: name });
};

// 2nd param to `model()` is the Model class to return.
const ProjectModel = model<Project, ProjectModelType>('Project', ProjectSchema);

run().catch(err => console.log(err));

async function run(): Promise<void> {
  await connect('mongodb://127.0.0.1:27017/test');

  // Equivalent to `ProjectModel.find({ stars: { $gt: 1000 }, name: 'mongoose' })`
  await ProjectModel.find().where('stars').gt(1000).byName('mongoose');
}
```

## Auto Typed Query Helpers

Mongoose does support auto typed Query Helpers that it are supplied in schema options.
Query Helpers functions can be defined as following:

```typescript
import { Schema, model } from 'mongoose';

const ProjectSchema = new Schema({
  name: String,
  stars: Number
}, {
  query: {
    byName(name: string) {
      return this.find({ name });
    }
  }
});

const ProjectModel = model('Project', ProjectSchema);

// Equivalent to `ProjectModel.find({ stars: { $gt: 1000 }, name: 'mongoose' })`
await ProjectModel.find().where('stars').gt(1000).byName('mongoose');
```

## Using Query Helper Overrides For Different Query Shapes

Sometimes you want a query helper to return a different type depending on whether the query is "lean" or not.
For example, suppose you want a `toMap()` query helper that converts the results of a query into a `Map` keyed by `_id`.
If you call `.lean()`, you want the map values to be plain objects; otherwise, you want hydrated documents.

To achieve this, you can use TypeScript function overloads on your query helper based on the value of `this`.
Here's an example of how to type a `toMap()` query helper so that it returns the correct type for both lean and non-lean queries:

```typescript
import { Model, HydratedDocument, QueryWithHelpers, Schema, model, Types } from 'mongoose';

// Query helper interface with overloads for lean and non-lean queries
export interface ToMapQueryHelpers<RawDocType, HydratedDocType> {
  // For non-lean queries: returns Map<string, HydratedDocType>
  toMap(this: QueryWithHelpers<HydratedDocType[], HydratedDocType>): QueryWithHelpers<Map<string, HydratedDocType>, HydratedDocType>;
  // For lean queries: returns Map<string, RawDocType>
  toMap(this: QueryWithHelpers<RawDocType[], HydratedDocType>): QueryWithHelpers<Map<string, RawDocType>, HydratedDocType>;
}

// Query helpers definition. Will be used in schema options
const query: ToMapQueryHelpers<IUser, UserHydratedDocument> = {
  // Chainable query helper that converts an array of documents to
  // a map of document _id (as a string) to the document
  toMap() {
    return this.transform((docs) => {
      // The `if` statements are type gymnastics to help TypeScript
      // handle the `IUser[] | UserHydratedDocument[]` union. Not necessary
      // for runtime correctness.
      if (docs.length === 0) return new Map();
      if (docs[0] instanceof Document) return new Map(docs.map(doc => [doc._id.toString(), doc]));
      return new Map(docs.map(doc => [doc._id.toString(), doc]));
    });
  }
};

export interface IUser {
  _id: Types.ObjectId;
  name: string;
}

export type UserHydratedDocument = HydratedDocument<IUser>;

export type UserModelType = Model<
  IUser,
  ToMapQueryHelpers<IUser, UserHydratedDocument>
>;

const userSchema = new Schema({ name: String }, { query });
const User = model<IUser, UserModelType>('User', userSchema);

async function run() {
  // Non-lean: Map<string, UserHydratedDocument>
  const hydratedMap = await User.find().toMap();
  // hydratedMap.get('someId') is a hydrated document

  // Lean: Map<string, IUser>
  const leanMap = await User.find().lean().toMap();
  // leanMap.get('someId') is a plain object

  // The following will fail at compile time, as expected, because `toMap()` shouldn't work with single documents or numbers
  // await User.findOne().toMap();
  // await User.countDocuments().toMap();
}
```

With this approach, TypeScript will infer the correct return type for `.toMap()` depending on whether you use `.lean()` or not. This ensures type safety and prevents accidental misuse of the query helper on queries that don't return arrays of documents.

<!-- END COPIED CONTENT -->
