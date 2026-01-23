# Sources for 08-advanced-modeling

This file copies Markdown content from the repo for this chapter. For deeper info, open the original file linked under each section.

---

## docs/advanced_schemas.md

Original file: [docs/advanced_schemas.md](../../advanced_schemas.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Advanced Schemas

## Creating from ES6 Classes Using `loadClass()`

Mongoose allows creating schemas from [ES6 classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes).
The `loadClass()` function lets you pull in methods,
statics, and virtuals from an ES6 class. A class method maps to a schema
method, a static method maps to a schema static, and getters/setters map
to virtuals.

```acquit
[require:Creating from ES6 Classes Using `loadClass\(\)`]
```

<!-- END COPIED CONTENT -->

---

## docs/discriminators.md

Original file: [docs/discriminators.md](../../discriminators.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Discriminators

## The `model.discriminator()` function

Discriminators are a schema inheritance mechanism. They enable
you to have multiple models with overlapping schemas on top of the
same underlying MongoDB collection.

Suppose you wanted to track different types of events in a single
collection. Every event will have a timestamp, but events that
represent clicked links should have a URL. You can achieve this
using the `model.discriminator()` function. This function takes
3 parameters, a model name, a discriminator schema and an optional
key (defaults to the model name). It returns a model whose schema
is the union of the base schema and the discriminator schema.

```acquit
[require:The `model.discriminator\(\)` function]
```

## Discriminators save to the Event model's collection

Suppose you created another discriminator to track events where
a new user registered. These `SignedUpEvent` instances will be
stored in the same collection as generic events and `ClickedLinkEvent`
instances.

```acquit
[require:Discriminators save to the Event model's collection]
```

## Discriminator keys

The way Mongoose tells the difference between the different discriminator models is by the 'discriminator key', which is `__t` by default.
Mongoose adds a String path called `__t` to your schemas that it uses to track which discriminator this document is an instance of.

```acquit
[require:Discriminator keys]
```

## Updating the discriminator key

By default, Mongoose doesn't let you update the discriminator key.
`save()` will throw an error if you attempt to update the discriminator key.
And `findOneAndUpdate()`, `updateOne()`, etc. will strip out discriminator key updates.

```acquit
[require:Update discriminator key]
```

To update a document's discriminator key, use `findOneAndUpdate()` or `updateOne()` with the `overwriteDiscriminatorKey` option set as follows.

```acquit
[require:use overwriteDiscriminatorKey to change discriminator key]
```

## Embedded discriminators in arrays

You can also define discriminators on embedded document arrays.
Embedded discriminators are different because the different discriminator types are stored in the same document array (within a document) rather than the same collection.
In other words, embedded discriminators let you store subdocuments matching different schemas in the same array.

As a general best practice, make sure you declare any hooks on your schemas **before** you use them.
You should **not** call `pre()` or `post()` after calling `discriminator()`.

```acquit
[require:Embedded discriminators in arrays]
```

## Single nested discriminators

You can also define discriminators on single nested subdocuments, similar to how you can define discriminators on arrays of subdocuments.

As a general best practice, make sure you declare any hooks on your schemas **before** you use them.
You should **not** call `pre()` or `post()` after calling `discriminator()`.

```acquit
[require:Single nested discriminators]
```

<!-- END COPIED CONTENT -->
