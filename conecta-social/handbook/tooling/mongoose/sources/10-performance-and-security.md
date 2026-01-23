# Sources for 10-performance-and-security

This file copies Markdown content from the repo for this chapter. For deeper info, open the original file linked under each section.

---

## docs/field-level-encryption.md

Original file: [docs/field-level-encryption.md](../../field-level-encryption.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Integrating with MongoDB Client Side Field Level Encryption

[Client Side Field Level Encryption](https://www.mongodb.com/docs/manual/core/csfle/), or CSFLE for short, is a tool for storing your data in an encrypted format in MongoDB.
For example, instead of storing the `name` property as a plain-text string, CSFLE means MongoDB will store your document with `name` as an encrypted buffer.
The resulting document will look similar to the following to a client that doesn't have access to decrypt the data.

<!--Using "js" as language, because "bson" does not exist and "js" has the better highlighting than "json"-->

```js
{
  "_id" : ObjectId("647a3207661e3a3a1bc3e614"),
  "name" : BinData(6,"ASrIv7XfokKwiCUJEjckOdgCG+u6IqavcOWX8hINz29MLvcKDZ4nnjCnPFZG+0ftVxMdWgzu6Vdh7ys1uIK1WiaPN0SqpmmtL2rPoqT9gfhADpGDmI60+vm0bJepXNY1Gv0="),
  "__v" : 0
}
```

You can read more about CSFLE on the [MongoDB CSFLE documentation](https://www.mongodb.com/docs/manual/core/csfle/) and [this blog post about CSFLE in Node.js](https://www.mongodb.com/developer/languages/javascript/client-side-field-level-encryption-csfle-mongodb-node/).

## Automatic FLE in Mongoose

Mongoose supports the declaration of encrypted schemas - schemas that, when connected to a model, utilize MongoDB's Client Side
Field Level Encryption or Queryable Encryption under the hood.  Mongoose automatically generates either an `encryptedFieldsMap` or a
`schemaMap` when instantiating a MongoClient and encrypts fields on write and decrypts fields on reads.

### Encryption types

MongoDB has two different automatic encryption implementations: client side field level encryption (CSFLE) and queryable encryption (QE).  
See [choosing an in-use encryption approach](https://www.mongodb.com/docs/v7.3/core/queryable-encryption/about-qe-csfle/#choosing-an-in-use-encryption-approach).

###  Declaring Encrypted Schemas

The following schema declares two properties, `name` and `ssn`.  `ssn` is encrypted using queryable encryption, and
is configured for equality queries:

```javascript
const encryptedUserSchema = new Schema({ 
  name: String,
  ssn: { 
    type: String, 
    // 1
    encrypt: { 
      keyId: '<uuid string of key id>',
      queries: 'equality'
    }
  }
  // 2
}, { encryptionType: 'queryableEncryption' });
```

To declare a field as encrypted, you must:

1. Annotate the field with encryption metadata in the schema definition
2. Choose an encryption type for the schema and configure the schema for the encryption type

Not all schematypes are supported for CSFLE and QE.  For an overview of supported BSON types, refer to MongoDB's documentation.

### Registering Models

Encrypted schemas can be registered on the global mongoose object or on a specific connection, so long as models are registered before the connection
is established:

```javascript
// specific connection
const GlobalUserModel = mongoose.model('User', encryptedUserSchema);

// specific connection
const connection = mongoose.createConnection();
const UserModel = connection.model('User', encryptedUserSchema);
```

### Connecting and configuring encryption options

Field level encryption in Mongoose works by generating the encryption schema that the MongoDB driver expects for each encrypted model on the connection.  This happens automatically when the model's connection is established.

Queryable encryption and CSFLE require all the same configuration as outlined in the [MongoDB encryption in-use documentation](https://www.mongodb.com/docs/manual/core/security-in-use-encryption/), except for the schemaMap or encryptedFieldsMap options.

```javascript
const keyVaultNamespace = 'client.encryption';
const kmsProviders = { local: { key } };
await connection.openUri(`mongodb://localhost:27017`, {
  // Configure auto encryption
  autoEncryption: {
    keyVaultNamespace: 'datakeys.datakeys',
    kmsProviders
  }
});
```

Once the connection is established, Mongoose's operations will work as usual.  Writes are encrypted automatically by the MongoDB driver prior to sending them to the server and reads are decrypted by the driver after fetching documents from the server.

### Discriminators

Discriminators are supported for encrypted models as well:

```javascript
const connection = createConnection();

const schema = new Schema({
  name: {
    type: String, encrypt: { keyId }
  }
}, {
  encryptionType: 'queryableEncryption'
});

const Model = connection.model('BaseUserModel', schema);
const ModelWithAge = model.discriminator('ModelWithAge', new Schema({
  age: {
    type: Int32, encrypt: { keyId: keyId2 }
  }
}, {
  encryptionType: 'queryableEncryption'
}));

const ModelWithBirthday = model.discriminator('ModelWithBirthday', new Schema({
  dob: {
    type: Int32, encrypt: { keyId: keyId3 }
  }
}, {
  encryptionType: 'queryableEncryption'
}));
```

When generating encryption schemas, Mongoose merges all discriminators together for all of the discriminators declared on the same namespace.  As a result, discriminators that declare the same key with different types are not supported.  Furthermore, all discriminators for the same namespace must share the same encryption type - it is not possible to configure discriminators on the same model for both CSFLE and Queryable Encryption.

## Managing Data Keys

Mongoose provides a convenient API to obtain a [ClientEncryption](https://mongodb.github.io/node-mongodb-native/Next/classes/ClientEncryption.html)
object configured to manage data keys in the key vault.  A client encryption can be obtained with the `Model.clientEncryption()` helper:

```javascript
const connection = createConnection();

const schema = new Schema({
  name: {
    type: String, encrypt: { keyId }
  }
}, {
  encryptionType: 'queryableEncryption'
});

const Model = connection.model('BaseUserModel', schema);
await connection.openUri(`mongodb://localhost:27017`, {
  autoEncryption: {
    keyVaultNamespace: 'datakeys.datakeys',
    kmsProviders: { local: '....' }
  }
});

const clientEncryption = Model.clientEncryption();
```

## Manual FLE in Mongoose

First, you need to install the [mongodb-client-encryption npm package](https://www.npmjs.com/package/mongodb-client-encryption).
This is MongoDB's official package for setting up encryption keys.

```sh
npm install mongodb-client-encryption
```

You also need to make sure you've installed [mongocryptd](https://www.mongodb.com/docs/manual/core/queryable-encryption/reference/mongocryptd/).
mongocryptd is a separate process from the MongoDB server that you need to run to work with field level encryption.
You can either run mongocryptd yourself, or make sure it is on the system PATH and the MongoDB Node.js driver will run it for you.
[You can read more about mongocryptd here](https://www.mongodb.com/docs/v5.0/reference/security-client-side-encryption-appendix/#mongocryptd).

Once you've set up and run mongocryptd, first you need to create a new encryption key as follows.
Keep in mind that the following example is a simple example to help you get started.
The encryption key in the following example is insecure; MongoDB recommends using a [KMS](https://www.mongodb.com/docs/v5.0/core/security-client-side-encryption-key-management/).

```javascript
const { ClientEncryption } = require('mongodb');
const mongoose = require('mongoose');

run().catch(err => console.log(err));

async function run() {
  /* Step 1: Connect to MongoDB and insert a key */

  // Create a very basic key. You're responsible for making
  // your key secure, don't use this in prod :)
  const arr = [];
  for (let i = 0; i < 96; ++i) {
    arr.push(i);
  }
  const key = Buffer.from(arr);

  const keyVaultNamespace = 'client.encryption';
  const kmsProviders = { local: { key } };

  const uri = 'mongodb://127.0.0.1:27017/mongoose_test';
  const conn = await mongoose.createConnection(uri, {
    autoEncryption: {
      keyVaultNamespace,
      kmsProviders
    }
  }).asPromise();
  const encryption = new ClientEncryption(conn.getClient(), {
    keyVaultNamespace,
    kmsProviders,
  });

  const _key = await encryption.createDataKey('local', {
    keyAltNames: ['exampleKeyName'],
  });
}
```

Once you have an encryption key, you can create a separate Mongoose connection with a [`schemaMap`](https://mongodb.github.io/node-mongodb-native/5.6/interfaces/AutoEncryptionOptions.html#schemaMap) that defines which fields are encrypted using JSON schema syntax as follows.

```javascript
/* Step 2: connect using schema map and new key */
await mongoose.connect('mongodb://127.0.0.1:27017/mongoose_test', {
  // Configure auto encryption
  autoEncryption: {
    keyVaultNamespace,
    kmsProviders,
    schemaMap: {
      'mongoose_test.tests': {
        bsonType: 'object',
        encryptMetadata: {
          keyId: [_key]
        },
        properties: {
          name: {
            encrypt: {
              bsonType: 'string',
              algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic'
            }
          }
        }
      }
    }
  }
});
```

With the above connection, if you create a model named 'Test' that uses the 'tests' collection, any documents will have their `name` property encrypted.

```javascript
// 'super secret' will be stored as 'BinData' in the database,
// if you query using the `mongo` shell.
const Model = mongoose.model('Test', mongoose.Schema({ name: String }));
await Model.create({ name: 'super secret' });
```

<!-- END COPIED CONTENT -->

---

## docs/enterprise.md

Original file: [docs/enterprise.md](../../enterprise.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Mongoose for Enterprise

## Available as part of the Tidelift Subscription

Tidelift is working with the maintainers of Mongoose and thousands of other
open source projects to deliver commercial support and maintenance for the
open source dependencies you use to build your applications. Save time,
reduce risk, and improve code health, while paying the maintainers of the
exact dependencies you use.

<a href="https://tidelift.com/subscription/pkg/npm-mongoose?utm_source=npm-mongoose&utm_medium=referral&utm_campaign=enterprise">
  <button class="mongoose-btn-outline">Learn More</button>
</a>
<a href="https://tidelift.com/subscription/request-a-demo?utm_source=npm-mongoose&utm_medium=referral&utm_campaign=enterprise">
  <button class="mongoose-btn-solid">Request a Demo</button>
</a>

## Enterprise-ready open source software—managed for you

The Tidelift Subscription is a managed open source subscription for application
dependencies covering millions of open source projects across JavaScript,
Python, Java, PHP, Ruby, .NET, and more.

Your subscription includes:

* Security updates

  Tidelift’s security response team coordinates patches for new breaking security
  vulnerabilities and alerts immediately through a private channel, so your
  software supply chain is always secure.

* Licensing verification and indemnification

  Tidelift verifies license information to enable easy policy enforcement and
  adds intellectual property indemnification to cover creators and users in case
  something goes wrong. You always have a 100% up-to-date bill of materials for
  your dependencies to share with your legal team, customers, or partners.

* Maintenance and code improvement

  Tidelift ensures the software you rely on keeps working as long as you need it
  to work. Your managed dependencies are actively maintained and we recruit
  additional maintainers where required.

* Package selection and version guidance

  We help you choose the best open source packages from the start—and then
  guide you through updates to stay on the best releases as new issues arise.

* Roadmap input

  Take a seat at the table with the creators behind the software you use.
  Tidelift’s participating maintainers earn more income as their software is
  used by more subscribers, so they’re interested in knowing what you need.

* Tooling and cloud integration

  Tidelift works with GitHub, GitLab, BitBucket, and more. We support every
  cloud platform (and other deployment targets, too).

The end result? All of the capabilities you expect from commercial-grade
software, for the full breadth of open source you use. That means less time
grappling with esoteric open source trivia, and more time building your own
applications—and your business.

<a href="https://tidelift.com/subscription/pkg/npm-mongoose?utm_source=npm-mongoose&utm_medium=referral&utm_campaign=enterprise">
  <button class="mongoose-btn-outline">Learn More</button>
</a>
<a href="https://tidelift.com/subscription/request-a-demo?utm_source=npm-mongoose&utm_medium=referral&utm_campaign=enterprise">
  <button class="mongoose-btn-solid">Request a Demo</button>
</a>

<!-- END COPIED CONTENT -->

---

## docs/tutorials/ssl.md

Original file: [docs/tutorials/ssl.md](../../tutorials/ssl.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# TLS/SSL Connections

Mongoose supports connecting to [MongoDB clusters that require TLS/SSL connections](https://www.mongodb.com/docs/manual/tutorial/configure-ssl/). Setting the `tls` option to `true` in [`mongoose.connect()`](../api/mongoose.html#mongoose_Mongoose-connect) or your connection string is enough to connect to a MongoDB cluster using TLS/SSL:

```javascript
mongoose.connect('mongodb://127.0.0.1:27017/test', { tls: true });

// Equivalent:
mongoose.connect('mongodb://127.0.0.1:27017/test?tls=true');
```

The `tls` option defaults to `false` for connection strings that start with `mongodb://`. However,
the `tls` option defaults to `true` for connection strings that start with `mongodb+srv://`. So if you are using an srv connection string to connect to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), TLS/SSL is enabled by default.

If you try to connect to a MongoDB cluster that requires TLS/SSL without enabling the `tls`/`ssl` option, `mongoose.connect()` will error out with the below error:

```no-highlight
MongooseServerSelectionError: connection <monitor> to 127.0.0.1:27017 closed
    at NativeConnection.Connection.openUri (/node_modules/mongoose/lib/connection.js:800:32)
    ...
```

## TLS/SSL Validation

By default, Mongoose validates the TLS/SSL certificate against a [certificate authority](https://en.wikipedia.org/wiki/Certificate_authority) to ensure the TLS/SSL certificate is valid. To disable this validation, set the `tlsAllowInvalidCertificates` (or `tlsInsecure`) option to `true`.

```javascript
mongoose.connect('mongodb://127.0.0.1:27017/test', {
  tls: true,
  tlsAllowInvalidCertificates: true,
});
```

In most cases, you should not disable TLS/SSL validation in production. However, `tlsAllowInvalidCertificates: true` is often helpful
for debugging SSL connection issues. If you can connect to MongoDB with `tlsAllowInvalidCertificates: true`, but not with
`tlsAllowInvalidCertificates: false`, then you can confirm Mongoose can connect to the server and the server is configured to use
TLS/SSL correctly, but there's some issue with the certificate.

For example, a common issue is the below error message:

```no-highlight
MongooseServerSelectionError: unable to verify the first certificate
```

This error is often caused by [self-signed MongoDB certificates](https://medium.com/@rajanmaharjan/secure-your-mongodb-connections-ssl-tls-92e2addb3c89) or other situations where the certificate sent by the MongoDB
server is not registered with an established certificate authority. The solution is to set the `tlsCAFile` option, which essentially sets a list of allowed SSL certificates.

```javascript
await mongoose.connect('mongodb://127.0.0.1:27017/test', {
  tls: true,
  // For example, see https://medium.com/@rajanmaharjan/secure-your-mongodb-connections-ssl-tls-92e2addb3c89
  // for where the `rootCA.pem` file comes from.
  tlsCAFile: `${__dirname}/rootCA.pem`,
});
```

Another common issue is the below error message:

```no-highlight
MongooseServerSelectionError: Hostname/IP does not match certificate's altnames: Host: hostname1. is not cert's CN: hostname2
```

The SSL certificate's [common name](https://knowledge.digicert.com/solution/SO7239.html) **must** line up with the host name
in your connection string. If the SSL certificate is for `hostname2.mydomain.com`, your connection string must connect to `hostname2.mydomain.com`, not any other hostname or IP address that may be equivalent to `hostname2.mydomain.com`. For replica sets, this also means that the SSL certificate's common name must line up with the [machine's `hostname`](../connections.html#replicaset-hostnames). To disable this validation, set the `tlsAllowInvalidHostnames` option to `true`.

## X.509 Authentication

If you're using [X.509 authentication](https://www.mongodb.com/docs/drivers/node/current/fundamentals/authentication/mechanisms/#x.509), you should set the user name in the connection string, **not** the `connect()` options.

```javascript
// Do this:
const username = 'myusername';
await mongoose.connect(`mongodb://${encodeURIComponent(username)}@127.0.0.1:27017/test`, {
  tls: true,
  tlsCAFile: `${__dirname}/rootCA.pem`,
  authMechanism: 'MONGODB-X509',
});

// Not this:
await mongoose.connect('mongodb://127.0.0.1:27017/test', {
  tls: true,
  tlsCAFile: `${__dirname}/rootCA.pem`,
  authMechanism: 'MONGODB-X509',
  auth: { username },
});
```

## X.509 Authentication with MongoDB Atlas

With MongoDB Atlas, X.509 certificates are not Root CA certificates and will not work with the `tlsCAFile` parameter as self-signed certificates would. If the `tlsCAFile` parameter is used an error similar to the following would be raised:

```no-highlight
MongoServerSelectionError: unable to get local issuer certificate
```

To connect to a MongoDB Atlas cluster using X.509 authentication the correct option to set is `tlsCertificateKeyFile`. The connection string already specifies the `authSource` and `authMechanism`, however they're included below as `connect()` options for completeness:

```javascript
const url = 'mongodb+srv://xyz.mongodb.net/test?authSource=%24external&authMechanism=MONGODB-X509';
await mongoose.connect(url, {
  tls: true,
  // location of a local .pem file that contains both the client's certificate and key
  tlsCertificateKeyFile: '/path/to/certificate.pem',
  authMechanism: 'MONGODB-X509',
  authSource: '$external',
});
```

**Note** The connection string options must be URL escaped correctly.

<!-- END COPIED CONTENT -->

---

## docs/lodash.md

Original file: [docs/lodash.md](../../lodash.md)

If you need deeper or canonical details, read the original file linked above.

<!-- BEGIN COPIED CONTENT -->

# Using Mongoose with Lodash

For the most part, Mongoose works well with [Lodash](https://lodash.com/).
However, there are a few caveats that you should know about.

* [`cloneDeep()`](#clonedeep)

## `cloneDeep()`

You should not use [Lodash's `cloneDeep()` function](https://lodash.com/docs/4.17.15#cloneDeep) on any Mongoose objects.
This includes [connections](connections.html), [model classes](models.html), and [queries](queries.html), but is *especially* important for [documents](documents.html).
For example, you may be tempted to do the following:

```javascript
const _ = require('lodash');

const doc = await MyModel.findOne();

const newDoc = _.cloneDeep(doc);
newDoc.myProperty = 'test';
await newDoc.save();
```

However, the above code will throw the following error if `MyModel` has any array properties.

```no-highlight
TypeError: this.__parentArray.$path is not a function
```

This is because Lodash's `cloneDeep()` function doesn't [handle proxies](https://stackoverflow.com/questions/50663784/lodash-clonedeep-remove-proxy-from-object), and [Mongoose arrays are proxies as of Mongoose 6](https://thecodebarbarian.com/introducing-mongoose-6.html#arrays-as-proxies).
You typically don't have to deep clone Mongoose documents, but, if you have to, use the following alternative to `cloneDeep()`:

```javascript
const doc = await MyModel.findOne();

const newDoc = new MyModel().init(doc.toObject());
newDoc.myProperty = 'test';
await newDoc.save();
```

<!-- END COPIED CONTENT -->
