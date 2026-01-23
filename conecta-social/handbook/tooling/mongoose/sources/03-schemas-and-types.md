# Sources for 03-schemas-and-types

This file copies Markdown content from the repo for this chapter. For deeper info, open the original file linked under each section.

---

## docs/schematypes.md

Original file: [docs/schematypes.md](../../schematypes.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# SchemaTypes

SchemaTypes handle definition of path
[defaults](api/schematype.html#schematype_SchemaType-default),
[validation](api/schematype.html#schematype_SchemaType-validate),
[getters](#getters),
[setters](api/schematype.html#schematype_SchemaType-set),
[field selection defaults](api/schematype.html#schematype_SchemaType-select) for
[queries](api/query.html),
and other general characteristics for Mongoose document properties.

* [What is a SchemaType?](#what-is-a-schematype)
* [The `type` Key](#type-key)
* [SchemaType Options](#schematype-options)
* [Usage Notes](#usage-notes)
* [Getters](#getters)
* [Custom Types](#customtypes)
* [The `schema.path()` Function](#path)
* [Further Reading](#further-reading)

## What is a SchemaType? {#what-is-a-schematype}

You can think of a Mongoose schema as the configuration object for a
Mongoose model. A SchemaType is then a configuration object for an individual
property. A SchemaType says what type a given
path should have, whether it has any getters/setters, and what values are
valid for that path.

```javascript
const schema = new Schema({ name: String });
schema.path('name') instanceof mongoose.SchemaType; // true
schema.path('name') instanceof mongoose.Schema.Types.String; // true
schema.path('name').instance; // 'String'
```

A SchemaType is different from a type. In other words, `mongoose.ObjectId !== mongoose.Types.ObjectId`.
A SchemaType is just a configuration object for Mongoose. An instance of
the `mongoose.ObjectId` SchemaType doesn't actually create MongoDB ObjectIds,
it is just a configuration for a path in a schema.

The following are all the valid SchemaTypes in Mongoose. Mongoose plugins
can also add custom SchemaTypes like [int32](http://plugins.mongoosejs.io/plugins/int32).
Check out [Mongoose's plugins search](http://plugins.mongoosejs.io) to find plugins.

* [String](#strings)
* [Number](#numbers)
* [Date](#dates)
* [Buffer](#buffers)
* [Boolean](#booleans)
* [Mixed](#mixed)
* [Union](#union)
* [ObjectId](#objectids)
* [Array](#arrays)
* [Decimal128](api/mongoose.html#mongoose_Mongoose-Decimal128)
* [Map](#maps)
* [Schema](#schemas)
* [UUID](#uuid)
* [BigInt](#bigint)
* [Double](#double)
* [Int32](#int32)

### Example

```javascript
const schema = new Schema({
  name: String,
  binary: Buffer,
  living: Boolean,
  updated: { type: Date, default: Date.now },
  age: { type: Number, min: 18, max: 65 },
  mixed: Schema.Types.Mixed,
  union: { type: Schema.Types.Union, of: [String, Number] },
  _someId: Schema.Types.ObjectId,
  decimal: Schema.Types.Decimal128,
  double: Schema.Types.Double,
  int32bit: Schema.Types.Int32,
  array: [],
  ofString: [String],
  ofNumber: [Number],
  ofDates: [Date],
  ofBuffer: [Buffer],
  ofBoolean: [Boolean],
  ofMixed: [Schema.Types.Mixed],
  ofObjectId: [Schema.Types.ObjectId],
  ofArrays: [[]],
  ofArrayOfNumbers: [[Number]],
  nested: {
    stuff: { type: String, lowercase: true, trim: true }
  },
  map: Map,
  mapOfString: {
    type: Map,
    of: String
  }
});

// example use

const Thing = mongoose.model('Thing', schema);

const m = new Thing;
m.name = 'Statue of Liberty';
m.age = 125;
m.updated = new Date;
m.binary = Buffer.alloc(0);
m.living = false;
m.mixed = { any: { thing: 'i want' } };
m.markModified('mixed');
m._someId = new mongoose.Types.ObjectId;
m.array.push(1);
m.ofString.push('strings!');
m.ofNumber.unshift(1, 2, 3, 4);
m.ofDates.addToSet(new Date);
m.ofBuffer.pop();
m.ofMixed = [1, [], 'three', { four: 5 }];
m.nested.stuff = 'good';
m.map = new Map([['key', 'value']]);
m.save(callback);
```

## The `type` Key {#type-key}

`type` is a special property in Mongoose schemas. When Mongoose finds
a nested property named `type` in your schema, Mongoose assumes that
it needs to define a SchemaType with the given type.

```javascript
// 3 string SchemaTypes: 'name', 'nested.firstName', 'nested.lastName'
const schema = new Schema({
  name: { type: String },
  nested: {
    firstName: { type: String },
    lastName: { type: String }
  }
});
```

As a consequence, [you need a little extra work to define a property named `type` in your schema](faq.html#type-key).
For example, suppose you're building a stock portfolio app, and you
want to store the asset's `type` (stock, bond, ETF, etc.). Naively,
you might define your schema as shown below:

```javascript
const holdingSchema = new Schema({
  // You might expect `asset` to be an object that has 2 properties,
  // but unfortunately `type` is special in Mongoose so mongoose
  // interprets this schema to mean that `asset` is a string
  asset: {
    type: String,
    ticker: String
  }
});
```

However, when Mongoose sees `type: String`, it assumes that you mean
`asset` should be a string, not an object with a property `type`.
The correct way to define an object with a property `type` is shown
below.

```javascript
const holdingSchema = new Schema({
  asset: {
    // Workaround to make sure Mongoose knows `asset` is an object
    // and `asset.type` is a string, rather than thinking `asset`
    // is a string.
    type: { type: String },
    ticker: String
  }
});
```

## SchemaType Options {#schematype-options}

You can declare a schema type using the type directly, or an object with
a `type` property.

```javascript
const schema1 = new Schema({
  test: String // `test` is a path of type String
});

const schema2 = new Schema({
  // The `test` object contains the "SchemaType options"
  test: { type: String } // `test` is a path of type string
});
```

In addition to the type property, you can specify additional properties
for a path. For example, if you want to lowercase a string before saving:

```javascript
const schema2 = new Schema({
  test: {
    type: String,
    lowercase: true // Always convert `test` to lowercase
  }
});
```

You can add any property you want to your SchemaType options. Many plugins
rely on custom SchemaType options. For example, the [mongoose-autopopulate](http://plugins.mongoosejs.io/plugins/autopopulate)
plugin automatically populates paths if you set `autopopulate: true` in your
SchemaType options. Mongoose comes with support for several built-in
SchemaType options, like `lowercase` in the above example.

The `lowercase` option only works for strings. There are certain options
which apply for all schema types, and some that apply for specific schema
types.

### All Schema Types

* `required`: boolean or function, if true adds a [required validator](validation.html#built-in-validators) for this property
* `default`: Any or function, sets a default value for the path. If the value is a function, the return value of the function is used as the default.
* `select`: boolean, specifies default [projections](https://www.mongodb.com/docs/manual/tutorial/project-fields-from-query-results/) for queries
* `validate`: function, adds a [validator function](validation.html#built-in-validators) for this property
* `get`: function, defines a custom getter for this property using [`Object.defineProperty()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty).
* `set`: function, defines a custom setter for this property using [`Object.defineProperty()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty).
* `alias`: string, mongoose >= 4.10.0 only. Defines a [virtual](guide.html#virtuals) with the given name that gets/sets this path.
* `immutable`: boolean, defines path as immutable. Mongoose prevents you from changing immutable paths unless the parent document has `isNew: true`.
* `transform`: function, Mongoose calls this function when you call [`Document#toJSON()`](api/document.html#document_Document-toJSON) function, including when you [`JSON.stringify()`](https://thecodebarbarian.com/the-80-20-guide-to-json-stringify-in-javascript) a document.

```javascript
const numberSchema = new Schema({
  integerOnly: {
    type: Number,
    get: v => Math.round(v),
    set: v => Math.round(v),
    alias: 'i'
  }
});

const Number = mongoose.model('Number', numberSchema);

const doc = new Number();
doc.integerOnly = 2.001;
doc.integerOnly; // 2
doc.i; // 2
doc.i = 3.001;
doc.integerOnly; // 3
doc.i; // 3
```

### Indexes

You can also define [MongoDB indexes](https://www.mongodb.com/docs/manual/indexes/)
using schema type options.

* `index`: boolean, whether to define an [index](https://www.mongodb.com/docs/manual/indexes/) on this property.
* `unique`: boolean, whether to define a [unique index](https://www.mongodb.com/docs/manual/core/index-unique/) on this property.
* `sparse`: boolean, whether to define a [sparse index](https://www.mongodb.com/docs/manual/core/index-sparse/) on this property.

```javascript
const schema2 = new Schema({
  test: {
    type: String,
    index: true,
    unique: true // Unique index. If you specify `unique: true`
    // specifying `index: true` is optional if you do `unique: true`
  }
});
```

### String {#string-validators}

* `lowercase`: boolean, whether to always call `.toLowerCase()` on the value
* `uppercase`: boolean, whether to always call `.toUpperCase()` on the value
* `trim`: boolean, whether to always call [`.trim()`](https://masteringjs.io/tutorials/fundamentals/trim-string) on the value
* `match`: RegExp, creates a [validator](validation.html) that checks if the value matches the given regular expression
* `enum`: Array, creates a [validator](validation.html) that checks if the value is in the given array.
* `minLength`: Number, creates a [validator](validation.html) that checks if the value length is not less than the given number
* `maxLength`: Number, creates a [validator](validation.html) that checks if the value length is not greater than the given number
* `populate`: Object, sets default [populate options](populate.html#query-conditions)

### Number {#number-validators}

* `min`: Number, creates a [validator](validation.html) that checks if the value is greater than or equal to the given minimum.
* `max`: Number, creates a [validator](validation.html) that checks if the value is less than or equal to the given maximum.
* `enum`: Array, creates a [validator](validation.html) that checks if the value is strictly equal to one of the values in the given array.
* `populate`: Object, sets default [populate options](populate.html#query-conditions)

### Date

* `min`: Date, creates a [validator](validation.html) that checks if the value is greater than or equal to the given minimum.
* `max`: Date, creates a [validator](validation.html) that checks if the value is less than or equal to the given maximum.
* `expires`: Number or String, creates a TTL index with the value expressed in seconds.

### ObjectId

* `populate`: Object, sets default [populate options](populate.html#query-conditions)

## Usage Notes {#usage-notes}

### String {#strings}

To declare a path as a string, you may use either the `String` global
constructor or the string `'String'`.

```javascript
const schema1 = new Schema({ name: String }); // name will be cast to string
const schema2 = new Schema({ name: 'String' }); // Equivalent

const Person = mongoose.model('Person', schema2);
```

If you pass an element that has a `toString()` function, Mongoose will call it,
unless the element is an array or the `toString()` function is strictly equal to
`Object.prototype.toString()`.

```javascript
new Person({ name: 42 }).name; // "42" as a string
new Person({ name: { toString: () => 42 } }).name; // "42" as a string

// "undefined", will get a cast error if you `save()` this document
new Person({ name: { foo: 42 } }).name;
```

### Number {#numbers}

To declare a path as a number, you may use either the `Number` global
constructor or the string `'Number'`.

```javascript
const schema1 = new Schema({ age: Number }); // age will be cast to a Number
const schema2 = new Schema({ age: 'Number' }); // Equivalent

const Car = mongoose.model('Car', schema2);
```

There are several types of values that will be successfully cast to a Number.

```javascript
new Car({ age: '15' }).age; // 15 as a Number
new Car({ age: true }).age; // 1 as a Number
new Car({ age: false }).age; // 0 as a Number
new Car({ age: { valueOf: () => 83 } }).age; // 83 as a Number
```

If you pass an object with a `valueOf()` function that returns a Number, Mongoose will
call it and assign the returned value to the path.

The values `null` and `undefined` are not cast.

NaN, strings that cast to NaN, arrays, and objects that don't have a `valueOf()` function
will all result in a [CastError](validation.html#cast-errors) once validated, meaning that it will not throw on initialization, only when validated.

### Dates {#dates}

[Built-in `Date` methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) are [**not** hooked into](https://github.com/Automattic/mongoose/issues/1598) the mongoose change tracking logic which in English means that if you use a `Date` in your document and modify it with a method like `setMonth()`, mongoose will be unaware of this change and `doc.save()` will not persist this modification. If you must modify `Date` types using built-in methods, tell mongoose about the change with `doc.markModified('pathToYourDate')` before saving.

```javascript
const Assignment = mongoose.model('Assignment', { dueDate: Date });
const doc = await Assignment.findOne();
doc.dueDate.setMonth(3);
await doc.save(); // THIS DOES NOT SAVE YOUR CHANGE

doc.markModified('dueDate');
await doc.save(); // works
```

### Buffer {#buffers}

To declare a path as a Buffer, you may use either the `Buffer` global
constructor or the string `'Buffer'`.

```javascript
const schema1 = new Schema({ binData: Buffer }); // binData will be cast to a Buffer
const schema2 = new Schema({ binData: 'Buffer' }); // Equivalent

const Data = mongoose.model('Data', schema2);
```

Mongoose will successfully cast the below values to buffers.

```js
const file1 = new Data({ binData: 'test'}); // {"type":"Buffer","data":[116,101,115,116]}
const file2 = new Data({ binData: 72987 }); // {"type":"Buffer","data":[27]}
const file4 = new Data({ binData: { type: 'Buffer', data: [1, 2, 3]}}); // {"type":"Buffer","data":[1,2,3]}
```

### Mixed {#mixed}

An "anything goes" SchemaType. Mongoose will not do any casting on mixed paths.
You can define a mixed path using `Schema.Types.Mixed` or by passing an empty
object literal. The following are equivalent.

```javascript
const Any = new Schema({ any: {} });
const Any = new Schema({ any: Object });
const Any = new Schema({ any: Schema.Types.Mixed });
const Any = new Schema({ any: mongoose.Mixed });
```

Since Mixed is a schema-less type, you can change the value to anything else you
like, but Mongoose loses the ability to auto detect and save those changes.
To tell Mongoose that the value of a Mixed type has changed, you need to
call `doc.markModified(path)`, passing the path to the Mixed type you just changed.

To avoid these side-effects, a [Subdocument](subdocs.html) path may be used
instead.

```javascript
person.anything = { x: [3, 4, { y: 'changed' }] };
person.markModified('anything');
person.save(); // Mongoose will save changes to `anything`.
```

### ObjectIds {#objectids}

An [ObjectId](https://www.mongodb.com/docs/manual/reference/method/ObjectId/)
is a special type typically used for unique identifiers. Here's how
you declare a schema with a path `driver` that is an ObjectId:

```javascript
const mongoose = require('mongoose');
const carSchema = new mongoose.Schema({ driver: mongoose.ObjectId });
```

`ObjectId` is a class, and ObjectIds are objects. However, they are
often represented as strings. When you convert an ObjectId to a string
using `toString()`, you get a 24-character hexadecimal string:

```javascript
const Car = mongoose.model('Car', carSchema);

const car = new Car();
car.driver = new mongoose.Types.ObjectId();

typeof car.driver; // 'object'
car.driver instanceof mongoose.Types.ObjectId; // true

car.driver.toString(); // Something like "5e1a0651741b255ddda996c4"
```

### Boolean {#booleans}

Booleans in Mongoose are [plain JavaScript booleans](https://www.w3schools.com/js/js_booleans.asp).
By default, Mongoose casts the below values to `true`:

* `true`
* `'true'`
* `1`
* `'1'`
* `'yes'`

Mongoose casts the below values to `false`:

* `false`
* `'false'`
* `0`
* `'0'`
* `'no'`

Any other value causes a [CastError](validation.html#cast-errors).
You can modify what values Mongoose converts to true or false using the
`convertToTrue` and `convertToFalse` properties, which are [JavaScript sets](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).

```javascript
const M = mongoose.model('Test', new Schema({ b: Boolean }));
console.log(new M({ b: 'nay' }).b); // undefined

// Set { false, 'false', 0, '0', 'no' }
console.log(mongoose.Schema.Types.Boolean.convertToFalse);

mongoose.Schema.Types.Boolean.convertToFalse.add('nay');
console.log(new M({ b: 'nay' }).b); // false
```

### Arrays {#arrays}

Mongoose supports arrays of [SchemaTypes](api/schema.html#schema_Schema-Types)
and arrays of [subdocuments](subdocs.html). Arrays of SchemaTypes are
also called *primitive arrays*, and arrays of subdocuments are also called
*document arrays*.

```javascript
const ToySchema = new Schema({ name: String });
const ToyBoxSchema = new Schema({
  toys: [ToySchema],
  buffers: [Buffer],
  strings: [String],
  numbers: [Number]
  // ... etc
});
```

Arrays are special because they implicitly have a default value of `[]` (empty array).

```javascript
const ToyBox = mongoose.model('ToyBox', ToyBoxSchema);
console.log((new ToyBox()).toys); // []
```

To overwrite this default, you need to set the default value to `undefined`

```javascript
const ToyBoxSchema = new Schema({
  toys: {
    type: [ToySchema],
    default: undefined
  }
});
```

Note: specifying an empty array is equivalent to `Mixed`. The following all create arrays of
`Mixed`:

```javascript
const Empty1 = new Schema({ any: [] });
const Empty2 = new Schema({ any: Array });
const Empty3 = new Schema({ any: [Schema.Types.Mixed] });
const Empty4 = new Schema({ any: [{}] });
```

### Maps {#maps}

A `MongooseMap` is a subclass of [JavaScript's `Map` class](http://thecodebarbarian.com/the-80-20-guide-to-maps-in-javascript.html).
In these docs, we'll use the terms 'map' and `MongooseMap` interchangeably.
In Mongoose, maps are how you create a nested document with arbitrary keys.

**Note**: In Mongoose Maps, keys must be strings in order to store the document in MongoDB.

```javascript
const userSchema = new Schema({
  // `socialMediaHandles` is a map whose values are strings. A map's
  // keys are always strings. You specify the type of values using `of`.
  socialMediaHandles: {
    type: Map,
    of: String
  }
});

const User = mongoose.model('User', userSchema);
// Map { 'github' => 'vkarpov15', 'twitter' => '@code_barbarian' }
console.log(new User({
  socialMediaHandles: {
    github: 'vkarpov15',
    twitter: '@code_barbarian'
  }
}).socialMediaHandles);
```

The above example doesn't explicitly declare `github` or `twitter` as paths,
but, since `socialMediaHandles` is a map, you can store arbitrary key/value
pairs. However, since `socialMediaHandles` is a map, you **must** use
`.get()` to get the value of a key and `.set()` to set the value of a key.

```javascript
const user = new User({
  socialMediaHandles: {}
});

// Good
user.socialMediaHandles.set('github', 'vkarpov15');
// Works too
user.set('socialMediaHandles.twitter', '@code_barbarian');
// Bad, the `myspace` property will **not** get saved
user.socialMediaHandles.myspace = 'fail';

// 'vkarpov15'
console.log(user.socialMediaHandles.get('github'));
// '@code_barbarian'
console.log(user.get('socialMediaHandles.twitter'));
// undefined
user.socialMediaHandles.github;

// Will only save the 'github' and 'twitter' properties
user.save();
```

Map types are stored as [BSON objects in MongoDB](https://en.wikipedia.org/wiki/BSON#Data_types_and_syntax).
Keys in a BSON object are ordered, so this means the [insertion order](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Description)
property of maps is maintained.

Mongoose supports a special `$*` syntax to [populate](populate.html) all elements in a map.
For example, suppose your `socialMediaHandles` map contains a `ref`:

```javascript
const userSchema = new Schema({
  socialMediaHandles: {
    type: Map,
    of: new Schema({
      handle: String,
      oauth: {
        type: ObjectId,
        ref: 'OAuth'
      }
    })
  }
});
const User = mongoose.model('User', userSchema);
```

To populate every `socialMediaHandles` entry's `oauth` property, you should populate
on `socialMediaHandles.$*.oauth`:

```javascript
const user = await User.findOne().populate('socialMediaHandles.$*.oauth');
```

### UUID {#uuid}

Mongoose also supports a UUID type that stores UUID instances as [Node.js buffers](https://thecodebarbarian.com/an-overview-of-buffers-in-node-js.html).
We recommend using [ObjectIds](#objectids) rather than UUIDs for unique document ids in Mongoose, but you may use UUIDs if you need to.

In Node.js, a UUID is represented as an instance of `bson.Binary` type with a [getter](./tutorials/getters-setters.html) that converts the binary to a string when you access it.
Mongoose stores UUIDs as [binary data with subtype 4 in MongoDB](https://www.mongodb.com/docs/manual/reference/bson-types/#binary-data).

```javascript
const authorSchema = new Schema({
  _id: Schema.Types.UUID, // Can also do `_id: 'UUID'`
  name: String
});

const Author = mongoose.model('Author', authorSchema);

const bookSchema = new Schema({
  authorId: { type: Schema.Types.UUID, ref: 'Author' }
});
const Book = mongoose.model('Book', bookSchema);

const author = new Author({ name: 'Martin Fowler' });
console.log(typeof author._id); // 'string'
console.log(author.toObject()._id instanceof mongoose.mongo.BSON.Binary); // true

const book = new Book({ authorId: '09190f70-3d30-11e5-8814-0f4df9a59c41' });
```

To create UUIDs, we recommend using [Node's built-in UUIDv4 generator](https://nodejs.org/api/crypto.html#cryptorandomuuidoptions).

```javascript
const { randomUUID } = require('crypto');

const schema = new mongoose.Schema({
  docId: {
    type: 'UUID',
    default: () => randomUUID()
  }
});
```

### BigInt {#bigint}

Mongoose supports [JavaScript BigInts](https://thecodebarbarian.com/an-overview-of-bigint-in-node-js.html) as a SchemaType.
BigInts are stored as [64-bit integers in MongoDB (BSON type "long")](https://www.mongodb.com/docs/manual/reference/bson-types/).

```javascript
const questionSchema = new Schema({
  answer: BigInt
});
const Question = mongoose.model('Question', questionSchema);

const question = new Question({ answer: 42n });
typeof question.answer; // 'bigint'
```

### Double {#double}

Mongoose supports [64-bit IEEE 754-2008 floating point numbers](https://en.wikipedia.org/wiki/IEEE_754-2008_revision) as a SchemaType.
Doubles are stored as [BSON type "double" in MongoDB](https://www.mongodb.com/docs/manual/reference/bson-types/).

```javascript
const temperatureSchema = new Schema({
  celsius: Double
});
const Temperature = mongoose.model('Temperature', temperatureSchema);

const temperature = new Temperature({ celsius: 1339 });
temperature.celsius instanceof bson.Double; // true
```

There are several types of values that will be successfully cast to a Double.

```javascript
new Temperature({ celsius: '1.2e12' }).celsius; // 15 as a Double
new Temperature({ celsius: true }).celsius; // 1 as a Double
new Temperature({ celsius: false }).celsius; // 0 as a Double
new Temperature({ celsius: { valueOf: () => 83.0033 } }).celsius; // 83 as a Double
new Temperature({ celsius: '' }).celsius; // null
```

The following inputs will result will all result in a [CastError](validation.html#cast-errors) once validated, meaning that it will not throw on initialization, only when validated:

* strings that do not represent a numeric string, a NaN or a null-ish value
* objects that don't have a `valueOf()` function
* an input that represents a value outside the bounds of a IEEE 754-2008 floating point

### Int32 {#int32}

Mongoose supports 32-bit integers as a SchemaType.
Int32s are stored as [32-bit integers in MongoDB (BSON type "int")](https://www.mongodb.com/docs/manual/reference/bson-types/).

```javascript
const studentSchema = new Schema({
  id: Int32
});
const Student = mongoose.model('Student', studentSchema);

const student = new Student({ id: 1339 });
typeof student.id; // 'number'
```

There are several types of values that will be successfully cast to a Number.

```javascript
new Student({ id: '15' }).id; // 15 as a Int32
new Student({ id: true }).id; // 1 as a Int32
new Student({ id: false }).id; // 0 as a Int32
new Student({ id: { valueOf: () => 83 } }).id; // 83 as a Int32
new Student({ id: '' }).id; // null as a Int32
```

If you pass an object with a `valueOf()` function that returns a Number, Mongoose will
call it and assign the returned value to the path.

The values `null` and `undefined` are not cast.

The following inputs will result will all result in a [CastError](validation.html#cast-errors) once validated, meaning that it will not throw on initialization, only when validated:

* NaN
* strings that cast to NaN
* objects that don't have a `valueOf()` function
* a decimal that must be rounded to be an integer
* an input that represents a value outside the bounds of an 32-bit integer

### Union {#union}

The `Union` SchemaType allows a path to accept multiple types. Mongoose will attempt to cast the value to one of the specified types.

```javascript
const schema = new Schema({
  value: {
    type: Schema.Types.Union,
    of: [String, Number]
  }
});

const Model = mongoose.model('Model', schema);

// Both work - Mongoose accepts either type
const doc1 = new Model({ value: 'hello' });
const doc2 = new Model({ value: 42 });
```

#### Casting Behavior

When you set a value on a Union path, Mongoose tries to cast it to each type in the `of` array in order. If the value matches one of the types exactly (using `===`), Mongoose uses that value. Otherwise, Mongoose uses the first type that successfully casts the value.

```javascript
const schema = new Schema({
  flexibleField: {
    type: Schema.Types.Union,
    of: [Number, Date]
  }
});

const Model = mongoose.model('Model', schema);

// Number type
const doc1 = new Model({ flexibleField: 42 });
doc1.flexibleField; // 42 (number)

// String '42' gets cast to Number (first type that succeeds)
const doc2 = new Model({ flexibleField: '42' });
doc2.flexibleField; // 42 (number)

// Date type
const doc3 = new Model({ flexibleField: new Date('2025-06-01') });
doc3.flexibleField; // Date object

// String date gets cast to Date
const doc4 = new Model({ flexibleField: '2025-06-01' });
doc4.flexibleField; // Date object
```

#### Error Handling

If Mongoose cannot cast the value to any of the specified types, it throws the error from the last type in the union.

```javascript
const schema = new Schema({
  value: {
    type: Schema.Types.Union,
    of: [Number, Boolean]
  }
});

const Model = mongoose.model('Model', schema);

const doc = new Model({ value: 'not a number or boolean' });
// Throws: Cast to Boolean failed for value "not a number or boolean"
```

#### Union with Options

You can specify options for individual types in the union, such as `trim` for strings.

```javascript
const schema = new Schema({
  value: {
    type: Schema.Types.Union,
    of: [
      Number,
      { type: String, trim: true }
    ]
  }
});

const Model = mongoose.model('Model', schema);

const doc = new Model({ value: '  hello  ' });
doc.value; // 'hello' (trimmed)
```

#### Queries and Updates

Union types work with queries and updates. Mongoose casts query filters and update operations according to the union types.

```javascript
const schema = new Schema({
  value: {
    type: Schema.Types.Union,
    of: [Number, Date]
  }
});

const Model = mongoose.model('Model', schema);

await Model.create({ value: 42 });

// Query with string - gets cast to number
const doc = await Model.findOne({ value: '42' });
doc.value; // 42

// Update
await Model.findOneAndUpdate(
  { value: 42 },
  { value: new Date('2025-06-01') }
);
```

## Getters {#getters}

Getters are like virtuals for paths defined in your schema. For example,
let's say you wanted to store user profile pictures as relative paths and
then add the hostname in your application. Below is how you would structure
your `userSchema`:

```javascript
const root = 'https://s3.amazonaws.com/mybucket';

const userSchema = new Schema({
  name: String,
  picture: {
    type: String,
    get: v => `${root}${v}`
  }
});

const User = mongoose.model('User', userSchema);

const doc = new User({ name: 'Val', picture: '/123.png' });
doc.picture; // 'https://s3.amazonaws.com/mybucket/123.png'
doc.toObject({ getters: false }).picture; // '/123.png'
```

Generally, you only use getters on primitive paths as opposed to arrays
or subdocuments. Because getters override what accessing a Mongoose path returns,
declaring a getter on an object may remove Mongoose change tracking for
that path.

```javascript
const schema = new Schema({
  arr: [{ url: String }]
});

const root = 'https://s3.amazonaws.com/mybucket';

// Bad, don't do this!
schema.path('arr').get(v => {
  return v.map(el => Object.assign(el, { url: root + el.url }));
});

// Later
doc.arr.push({ key: String });
doc.arr[0]; // 'undefined' because every `doc.arr` creates a new array!
```

Instead of declaring a getter on the array as shown above, you should
declare a getter on the `url` string as shown below. If you need to declare
a getter on a nested document or array, be very careful!

```javascript
const schema = new Schema({
  arr: [{ url: String }]
});

const root = 'https://s3.amazonaws.com/mybucket';

// Good, do this instead of declaring a getter on `arr`
schema.path('arr.0.url').get(v => `${root}${v}`);
```

## Schemas {#schemas}

To declare a path as another [schema](guide.html#definition),
set `type` to the sub-schema's instance.

To set a default value based on the sub-schema's shape, simply set a default value,
and the value will be cast based on the sub-schema's definition before being set
during document creation.

```javascript
const subSchema = new mongoose.Schema({
  // some schema definition here
});

const schema = new mongoose.Schema({
  data: {
    type: subSchema,
    default: {}
  }
});
```

## Creating Custom Types {#customtypes}

Mongoose can also be extended with [custom SchemaTypes](customschematypes.html). Search the
[plugins](http://plugins.mongoosejs.io)
site for compatible types like
[mongoose-long](https://github.com/aheckmann/mongoose-long),
[mongoose-int32](https://github.com/vkarpov15/mongoose-int32),
and
[mongoose-function](https://github.com/aheckmann/mongoose-function).

Read more about creating custom SchemaTypes in our [Custom SchemaTypes guide](customschematypes.html).

## The `schema.path()` Function {#path}

The `schema.path()` function returns the instantiated schema type for a
given path.

```javascript
const sampleSchema = new Schema({ name: { type: String, required: true } });
console.log(sampleSchema.path('name'));
// Output looks like:
/**
 * SchemaString {
 *   enumValues: [],
  *   regExp: null,
  *   path: 'name',
  *   instance: 'String',
  *   validators: ...
  */
  ```

You can use this function to inspect the schema type for a given path,
including what validators it has and what the type is.

## Further Reading {#further-reading}

<ul>
  <li><a href="https://masteringjs.io/tutorials/mongoose/schematype">An Introduction to Mongoose SchemaTypes</a></li>
  <li><a href="https://kb.objectrocket.com/mongo-db/mongoose-schema-types-1418">Mongoose Schema Types</a></li>
</ul>

## Next Up

Now that we've covered `SchemaTypes`, let's take a look at [Connections](connections.html).

<!-- END COPIED CONTENT -->

---

## docs/geojson.md

Original file: [docs/geojson.md](../../geojson.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Using GeoJSON

[GeoJSON](http://geojson.org/) is a format for storing geographic points and
polygons. [MongoDB has excellent support for geospatial queries](http://thecodebarbarian.com/80-20-guide-to-mongodb-geospatial-queries)
on GeoJSON objects. Let's take a look at how you can use Mongoose to store
and query GeoJSON objects.

## Point Schema {#points}

The most simple structure in GeoJSON is a point. Below is an example point
representing the approximate location of [San Francisco](https://www.google.com/maps/@37.7,-122.5,9z).
Note that longitude comes first in a GeoJSON coordinate array, **not** latitude.

```json
{
  "type" : "Point",
  "coordinates" : [
    -122.5,
    37.7
  ]
}
```

Below is an example of a Mongoose schema where `location` is a point.

```javascript
const citySchema = new mongoose.Schema({
  name: String,
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
});
```

Using [subdocuments](subdocs.html), you can define a common `pointSchema` and reuse it everywhere you want to store a GeoJSON point.

```javascript
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

const citySchema = new mongoose.Schema({
  name: String,
  location: {
    type: pointSchema,
    required: true
  }
});
```

## Polygon Schema {#polygons}

GeoJSON polygons let you define an arbitrary shape on a map. For example,
the below polygon is a GeoJSON rectangle that approximates the border
of the state of Colorado.

```json
{
  "type": "Polygon",
  "coordinates": [[
    [-109, 41],
    [-102, 41],
    [-102, 37],
    [-109, 37],
    [-109, 41]
  ]]
}
```

Polygons are tricky because they use triple nested arrays. Below is
how you create a Mongoose schema where `coordinates` is a triple nested
array of numbers.

```javascript
const polygonSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Polygon'],
    required: true
  },
  coordinates: {
    type: [[[Number]]], // Array of arrays of arrays of numbers
    required: true
  }
});

const citySchema = new mongoose.Schema({
  name: String,
  location: polygonSchema
});
```

## Geospatial Queries with Mongoose {#querying}

Mongoose queries support the same [geospatial query operators](http://thecodebarbarian.com/80-20-guide-to-mongodb-geospatial-queries)
that the MongoDB driver does. For example, the below script saves a
`city` document those `location` property is a GeoJSON point representing
the city of Denver, Colorado. It then queries for all documents within
a polygon representing the state of Colorado using
[the MongoDB `$geoWithin` operator](https://www.mongodb.com/docs/manual/reference/operator/query/geoWithin/).

<img src="https://i.imgur.com/i32pWnC.png" alt="Colorado GeoJSON Polygon">

```acquit
[require:geojson.*driver query]
```

Mongoose also has a [`within()` helper](api/query.html#query_Query-within)
that's a shorthand for `$geoWithin`.

```acquit
[require:geojson.*within helper]
```

## Geospatial Indexes {#geospatial-indexes}

MongoDB supports [2dsphere indexes](https://www.mongodb.com/docs/manual/core/2dsphere/)
for speeding up geospatial queries. Here's how you can define
a 2dsphere index on a GeoJSON point:

```acquit
[require:geojson.*index$]
```

You can also define a geospatial index using the [`Schema#index()` function](api/schema.html#schema_Schema-index)
as shown below.

```javascript
citySchema.index({ location: '2dsphere' });
```

MongoDB's [`$near` query operator](https://www.mongodb.com/docs/manual/reference/operator/query/near/)
and [`$geoNear` aggregation stage](https://www.mongodb.com/docs/manual/reference/operator/aggregation/geoNear/#pipe._S_geoNear)
*require* a 2dsphere index.

<!-- END COPIED CONTENT -->

---

## docs/customschematypes.md

Original file: [docs/customschematypes.md](../../customschematypes.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Custom Schema Types

## Creating a Basic Custom Schema Type

*New in Mongoose 4.4.0:* Mongoose supports custom types. Before you
reach for a custom type, however, know that a custom type is overkill
for most use cases. You can do most basic tasks with
[custom getters/setters](http://mongoosejs.com/docs/2.7.x/docs/getters-setters.html),
[virtuals](http://mongoosejs.com/docs/guide.html#virtuals), and
[single embedded docs](http://mongoosejs.com/docs/subdocs.html#single-embedded).

Let's take a look at an example of a basic schema type: a 1-byte integer.
To create a new schema type, you need to inherit from `mongoose.SchemaType`
and add the corresponding property to `mongoose.Schema.Types`. The one
method you need to implement is the `cast()` method.

```acquit
[require:Creating a Basic Custom Schema Type]
```

<!-- END COPIED CONTENT -->

---

## docs/shared-schemas.md

Original file: [docs/shared-schemas.md](../../shared-schemas.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Sharing Schemas Between Mongoose Projects

In larger organizations, it is common to have a project that contains schemas which are shared between multiple projects.
For example, suppose your company has an `@initech/shared-schemas` private npm package, and `npm list` looks like the following:

```sh
@initech/web-app1@1.0.0
├── @initech/shared-schemas@1.0.0
├── mongoose@8.0.1
```

In the above output, `@initech/web-app1` is a *client project* and `@initech/shared-schemas` is the *shared library*.

## Put Mongoose as a Peer Dependency

First, and most importantly, we recommend that `@initech/shared-schemas` list Mongoose in [your shared-schema's `peerDependencies`](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#peerdependencies), **not** as a top-level dependency.
For example, `@initech/shared-schemas`'s `package.json` should look like the following.

```javascript
{
  "name": "@initech/shared-schemas",
  "peerDependencies": {
    "mongoose": "8.x"
  }
}
```

We recommend this approach for the following reasons:

1. Easier to upgrade. For example, suppose `@initech/shared-schemas` has a dependency on Mongoose 8, and `@initech/web-app1` works fine with Mongoose 8; but `@initech/web-app2` cannot upgrade from Mongoose 7. Peer dependencies makes it easier for the projects that rely on your shared schemas to determine which version of Mongoose they want, without risking having conflicting versions of the Mongoose module.
2. Reduce risk of Mongoose module duplicates. Using Mongoose schemas and models from one version of Mongoose with another version is not supported.

## Export Schemas, Not Models

We recommend that `@initech/shared-schemas` export Mongoose schemas, **not** models.
This approach is more flexible and allows client projects to instantiate models using their preferred patterns.
In particular, if `@initech/shared-schemas` exports a model that is registered using `mongoose.model()`, there is no way to transfer that model to a different connection.

```javascript
// `userSchema.js` in `@initech/shared-schemas`
const userSchema = new mongoose.Schema({ name: String });

// Do this:
module.exports = userSchema;

// Not this:
module.exports = mongoose.model('User', userSchema);
```

## Workaround: Export a POJO

Sometimes, existing shared libraries don't follow the above best practices.
If you find yourself with a shared library that depends on an old version of Mongoose, a helpful workaround is to export a [POJO](https://masteringjs.io/tutorials/fundamentals/pojo) rather than a schema or model.
This will remove any conflicts between the shared library's version of Mongoose and the client project's version of Mongoose.

```javascript
// Replace this:
module.exports = new mongoose.Schema({ name: String });

// With this:
module.exports = { name: String };
```

And update your client project to do the following:

```javascript
// Replace this:
const { userSchema } = require('@initech/shared-schemas');

// With this:
const { userSchemaDefinition } = require('@initech/shared-schemas');
const userSchema = new mongoose.Schema(userSchemaDefinition);
```

<!-- END COPIED CONTENT -->

---

## docs/defaults.md

Original file: [docs/defaults.md](../../defaults.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Defaults

## Declaring Defaults in Your Schema

Your schemas can define default values for certain paths. If you create
a new document without that path set, the default will kick in.

Note: Mongoose only applies a default if the value of the path is
strictly `undefined`.

```acquit
[require:Declaring defaults in your schema]
```

## Default Functions

You can also set the `default` schema option to a function. Mongoose will
execute that function and use the return value as the default.

```acquit
[require:Default functions]
```

## The `setDefaultsOnInsert` Option

Mongoose also sets defaults on `update()` and `findOneAndUpdate()` when the `upsert` option is set by adding your schema's defaults to a [MongoDB `$setOnInsert` operator](https://www.mongodb.com/docs/manual/reference/operator/update/setOnInsert/).
You can disable this behavior by setting the `setDefaultsOnInsert` option to `false`.

```acquit
[require:The `setDefaultsOnInsert` option]
```

You can also set `setDefaultsOnInsert` to `false` globally:

```javascript
mongoose.set('setDefaultsOnInsert', false);
```

## Default functions and `this`

Unless it is running on a query with `setDefaultsOnInsert`, a default
function's `this` refers to the document.

```acquit
[require:Default functions and `this`]
```

<!-- END COPIED CONTENT -->

---

## docs/tutorials/virtuals.md

Original file: [docs/tutorials/virtuals.md](../../tutorials/virtuals.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Mongoose Virtuals

In Mongoose, a virtual is a property that is **not** stored in MongoDB.
Virtuals are typically used for computed properties on documents.

* [Your First Virtual](#your-first-virtual)
* [Virtual Setters](#virtual-setters)
* [Virtuals in JSON](#virtuals-in-json)
* [Virtuals with Lean](#virtuals-with-lean)
* [Limitations](#limitations)
* [Populate](#populate)
* [Virtuals via schema options](#virtuals-via-schema-options)
* [Further Reading](#further-reading)

## Your First Virtual

Suppose you have a `User` model. Every user has an `email`, but you also
want the email's domain. For example, the domain portion of
'test@gmail.com' is 'gmail.com'.

Below is one way to implement the `domain` property using a virtual.
You define virtuals on a schema using the [`Schema#virtual()` function](../api/schema.html#schema_Schema-virtual).

```acquit
[require:Virtuals.*basic]
```

The `Schema#virtual()` function returns a [`VirtualType` object](../api/virtualtype.html). Unlike normal document properties,
virtuals do not have any underlying value and Mongoose does not do
any type coercion on virtuals. However, virtuals do have
[getters and setters](getters-setters.html), which make
them ideal for computed properties, like the `domain` example above.

## Virtual Setters

You can also use virtuals to set multiple properties at once as an
alternative to [custom setters on normal properties](getters-setters.html#setters). For example, suppose
you have two string properties: `firstName` and `lastName`. You can
create a virtual property `fullName` that lets you set both of
these properties at once. The key detail is that, in virtual getters and
setters, `this` refers to the document the virtual is attached to.

```acquit
[require:Virtuals.*fullName]
```

## Virtuals in JSON

By default, Mongoose does not include virtuals when you convert a document to JSON.
For example, if you pass a document to [Express'  `res.json()` function](http://expressjs.com/en/4x/api.html#res.json), virtuals will **not** be included by default.

To include virtuals in `res.json()`, you need to set the
[`toJSON` schema option](../guide.html#toJSON) to `{ virtuals: true }`.

```acquit
[require:Virtuals.*toJSON]
```

## Virtuals in `console.log()`

By default, Mongoose does **not** include virtuals in `console.log()` output.
To include virtuals in `console.log()`, you need to set the [`toObject` schema option](../guide.html#toObject) to `{ virtuals: true }`, or use `toObject()` before printing the object.

```javascript
console.log(doc.toObject({ virtuals: true }));
```

## Virtuals with Lean

Virtuals are properties on Mongoose documents. If you use the
[lean option](lean.html), that means your queries return POJOs
rather than full Mongoose documents. That means no virtuals if you use
[`lean()`](../api/query.html#query_Query-lean).

```acquit
[require:Virtuals.*lean]
```

If you use `lean()` for performance, but still need virtuals, Mongoose
has an
[officially supported `mongoose-lean-virtuals` plugin](https://plugins.mongoosejs.io/plugins/lean-virtuals)
that decorates lean documents with virtuals.

## Limitations

Mongoose virtuals are **not** stored in MongoDB, which means you can't query
based on Mongoose virtuals.

```acquit
[require:Virtuals.*in query]
```

If you want to query by a computed property, you should set the property using
a [custom setter](getters-setters.html) or [pre save middleware](../middleware.html).

## Populate

Mongoose also supports [populating virtuals](../populate.html). A populated
virtual contains documents from another collection. To define a populated
virtual, you need to specify:

* The `ref` option, which tells Mongoose which model to populate documents from.
* The `localField` and `foreignField` options. Mongoose will populate documents from the model in `ref` whose `foreignField` matches this document's `localField`.

```acquit
[require:Virtuals.*populate]
```

## Virtuals via schema options

Virtuals can also be defined in the schema-options directly without having to use [`.virtual`](../api/schema.html#Schema.prototype.virtual):

```acquit
[require:Virtuals.*schema-options fullName]
```

The same also goes for virtual options, like virtual populate:

```acquit
[require:Virtuals.*schema-options populate]
```

## Further Reading

* [Virtuals in Mongoose Schemas](../guide.html#virtuals)
* [Populate Virtuals](../populate.html#populate-virtuals)
* [Mongoose Lean Virtuals plugin](https://plugins.mongoosejs.io/plugins/lean-virtuals)
* [Getting Started With Mongoose Virtuals](https://masteringjs.io/tutorials/mongoose/virtuals)
* [Understanding Virtuals in Mongoose](https://futurestud.io/tutorials/understanding-virtuals-in-mongoose)

<!-- END COPIED CONTENT -->

---

## docs/tutorials/getters-setters.md

Original file: [docs/tutorials/getters-setters.md](../../tutorials/getters-setters.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Getters/Setters in Mongoose

Mongoose getters and setters allow you to execute custom logic when getting or setting a property on a [Mongoose document](../documents.html). Getters let you transform data in MongoDB into a more user friendly form, and setters let you transform user data before it gets to MongoDB.

## Getters

Suppose you have a `User` collection and you want to obfuscate user emails to protect your users' privacy. Below is a basic `userSchema` that obfuscates the user's email address.

```acquit
[require:getters/setters.*getters.*basic example]
```

Keep in mind that getters do **not** impact the underlying data stored in
MongoDB. If you save `user`, the `email` property will be 'ab@gmail.com' in
the database.

By default, Mongoose does **not** execute getters when converting a document to JSON, including [Express' `res.json()` function](http://expressjs.com/en/4x/api.html#res.json).

```javascript
app.get(function(req, res) {
  return User.findOne().
    // The `email` getter will NOT run here
    then(doc => res.json(doc)).
    catch(err => res.status(500).json({ message: err.message }));
});
```

To run getters when converting a document to JSON, set the [`toJSON.getters` option to `true` in your schema](../guide.html#toJSON) as shown below.

```javascript
const userSchema = new Schema({
  email: {
    type: String,
    get: obfuscate
  }
}, { toJSON: { getters: true } });

// Or, globally
mongoose.set('toJSON', { getters: true });

// Or, on a one-off basis
app.get(function(req, res) {
  return User.findOne().
    // The `email` getter will run here
    then(doc => res.json(doc.toJSON({ getters: true }))).
    catch(err => res.status(500).json({ message: err.message }));
});
```

To skip getters on a one-off basis, use [`user.get()` with the `getters` option set to `false`](../api/document.html#document_Document-get) as shown below.

```acquit
[require:getters/setters.*getters.*skip]
```

## Setters

Suppose you want to make sure all user emails in your database are lowercased to
make it easy to search without worrying about case. Below is an example
`userSchema` that ensures emails are lowercased.

```acquit
[require:getters/setters.*setters.*basic]
```

Mongoose also runs setters on update operations, like [`updateOne()`](../api/query.html#query_Query-updateOne). Mongoose will
[upsert a document](https://masteringjs.io/tutorials/mongoose/upsert) with a
lowercased `email` in the below example.

```acquit
[require:getters/setters.*setters.*updates]
```

In a setter function, `this` can be either the document being set or the query
being run. If you don't want your setter to run when you call `updateOne()`,
you add an if statement that checks if `this` is a Mongoose document as shown
below.

```acquit
[require:getters/setters.*setters.*update skip]
```

## Passing Parameters using `$locals`

You can't pass parameters to your getter and setter functions like you do to normal function calls.
To configure or pass additional properties to your getters and setters, you can use the document's `$locals` property.

The `$locals` property is the preferred place to store any program-defined data on your document without conflicting with schema-defined properties.
In your getter and setter functions, `this` is the document being accessed, so you set properties on `$locals` and then access those properties in your getters examples.
For example, the following shows how you can use `$locals` to configure the language for a custom getter that returns a string in different languages.

```acquit
[require:getters/setters.*localization.*locale]
```

## Differences vs ES6 Getters/Setters

Mongoose setters are different from [ES6 setters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set) because they allow you to transform the value being set. With ES6 setters, you
would need to store an internal `_email` property to use a setter. With Mongoose,
you do **not** need to define an internal `_email` property or define a
corresponding getter for `email`.

```acquit
[require:getters/setters.*setters.*vs ES6]
```

<!-- END COPIED CONTENT -->

---

## docs/tutorials/dates.md

Original file: [docs/tutorials/dates.md](../../tutorials/dates.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Working With Dates

Here's how you declare a path of type `Date` with a Mongoose schema:

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  // `lastActiveAt` is a date
  lastActiveAt: Date
});
const User = mongoose.model('User', userSchema);
```

When you create a user [document](../documents.html), Mongoose will cast
the value to a [native JavaScript date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
using the [`Date()` constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#Syntax).

```acquit
[require:Date Tutorial.*Example 1.2]
```

An invalid date will lead to a `CastError` when you [validate the document](../validation.html).

```acquit
[require:Date Tutorial.*Example 1.3]
```

## Validators

Dates have two built-in validators: `min` and `max`. These validators will
report a `ValidatorError` if the given date is strictly less than `min` or
strictly greater than `max`.

```acquit
[require:Date Tutorial.*Example 1.2.1]
```

## Querying

MongoDB supports querying by date ranges and sorting by dates. Here's some
examples of querying by dates, date ranges, and sorting by date:

```acquit
[require:Date Tutorial.*Example 1.3.1]
```

## Casting Edge Cases

Date casting has a couple small cases where it differs from JavaScript's
native date parsing. First, Mongoose looks for a [`valueOf()` function](https://www.w3schools.com/jsref/jsref_valueof_string.asp) on the given object,
and calls `valueOf()` before casting the date. This means Mongoose can cast
[moment objects](http://npmjs.com/package/moment) to dates automatically.

```acquit
[require:Date Tutorial.*Example 1.4.1]
```

By default, if you pass a numeric
string to the Date constructor, JavaScript will attempt to convert it to a
year.

```javascript
new Date(1552261496289); // "2019-03-10T23:44:56.289Z"
new Date('1552261496289'); // "Invalid Date"
new Date('2010'); // 2010-01-01T00:00:00.000Z
```

Mongoose converts numeric strings that contain numbers outside the [range of representable dates in JavaScript](https://stackoverflow.com/questions/11526504/minimum-and-maximum-date) and converts them to numbers before passing them to the date constructor.

```acquit
[require: Date Tutorial.*Example 1.4.3]
```

## Timezones

[MongoDB stores dates as 64-bit integers](http://bsonspec.org/spec.html), which
means that Mongoose does **not** store timezone information by default. When
you call `Date#toString()`, the JavaScript runtime will use [your OS' timezone](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset).

<!-- END COPIED CONTENT -->
