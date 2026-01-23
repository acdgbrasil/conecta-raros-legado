# 02 - Connections and Topology

## Contents
- [Connection patterns](#connection-patterns)
- [Multiple connections](#multiple-connections)
- [Pooling and timeouts](#pooling-and-timeouts)
- [Connection events](#connection-events)
- [TLS/SSL](#tlsssl)
- [Read preference and write concern](#read-preference-and-write-concern)
- [Replica sets, sharding, and failover](#replica-sets-sharding-and-failover)
- [Buffering and `bufferCommands`](#buffering-and-buffercommands)
- [Retryable writes](#retryable-writes)
- [AI agent checklist](#ai-agent-checklist)


## Connection patterns
Prefer a single shared connection per Node.js process.

Good example: cached connection (serverless-safe)
```js
import mongoose from 'mongoose';

let cached = global.__mongoose;
if (!cached) cached = global.__mongoose = { conn: null, promise: null };

export async function connect(uri) {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```

Bad example: new connection per request
```js
export async function handler() {
  await mongoose.connect(process.env.MONGO_URL);
  // ...
  await mongoose.disconnect();
}
```

## Multiple connections
Use `mongoose.createConnection()` when you must connect to multiple databases.

```js
const connA = mongoose.createConnection(uriA);
const connB = mongoose.createConnection(uriB);

const UserA = connA.model('User', userSchema);
const UserB = connB.model('User', userSchema);
```

## Pooling and timeouts
Connection pooling is managed by the MongoDB driver. Tune for your workload.

Good example: explicit pool size and timeouts
```js
await mongoose.connect(uri, {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 10000,
});
```

Bad example: no timeouts for production
```js
// Can cause requests to hang indefinitely on network issues.
await mongoose.connect(uri);
```

## Connection events
Listen for errors and disconnections.

```js
mongoose.connection.on('error', (err) => {
  console.error('Mongo error', err);
});
```

## TLS/SSL
Use TLS for production connections. Your MongoDB URI can include `tls=true` and CA settings.

Good example: TLS options
```js
await mongoose.connect(uri, {
  tls: true,
  tlsCAFile: process.env.MONGO_CA_FILE,
});
```

Bad example: disabling TLS in production
```js
await mongoose.connect(uri, { tls: false });
```

## Read preference and write concern
Control consistency and durability with read/write settings.

```js
await mongoose.connect(uri, {
  readPreference: 'primary',
  writeConcern: { w: 'majority', j: true },
});
```

Bad example: write with unsafe concerns
```js
await mongoose.connect(uri, { writeConcern: { w: 0 } });
```

## Replica sets, sharding, and failover
- Transactions require replica sets or sharded clusters.
- Use `readPreference` and `writeConcern` intentionally.
- Avoid silent failover by inspecting connection state.

## Buffering and `bufferCommands`
- `bufferCommands: true` queues operations until connected.
- `bufferCommands: false` fails fast when not connected.

Good example: fail fast in serverless
```js
await mongoose.connect(uri, { bufferCommands: false });
```

Bad example: infinite buffering hides connection bugs
```js
// Default buffering can mask failures for a long time.
await mongoose.connect(uri);
```

## Retryable writes
The driver supports retryable writes on modern deployments. Avoid custom retry loops that duplicate writes.

Good example: rely on driver retryable writes where supported

Bad example: naive retries without idempotency keys
```js
// This can double-insert if the first write actually succeeded.
await Orders.create({ orderId, total });
```

## AI agent checklist
- Reuse a single connection per process.
- Use server selection timeouts to avoid hanging.
- Confirm transactions are supported by the server topology.
