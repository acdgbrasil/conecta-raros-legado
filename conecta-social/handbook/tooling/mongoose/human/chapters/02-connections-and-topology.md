# 02 - Conexoes e topologia

## Objetivo

Explicar como Mongoose se conecta ao MongoDB e como escolher a topologia correta.

## Conceitos principais

- Strings de conexao definem replica set, auth e parametros de rede.
- Pooling controla concorrencia e custos de conexao.
- Eventos da conexao ajudam a monitorar estado e erros.

## Quando usar

- Ao configurar ambientes de producao e staging.
- Quando for usar replica set, sharding ou Atlas.

## Armadilhas comuns

- Abrir multiplas conexoes desnecessarias.
- Ignorar timeouts e reconexao.
- Misturar conexoes sem separar responsabilidades.

## Checklist humano

- Conexao unica por app e reaproveitada.
- Timeouts e retry configurados.
- Eventos de conexao monitorados.

## Exemplos e reforco

### Exemplo bom

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

### Exemplo ruim

```js
export async function handler() {
  await mongoose.connect(process.env.MONGO_URL);
  // ...
  await mongoose.disconnect();
}
```

### Exemplo

```js
const connA = mongoose.createConnection(uriA);
const connB = mongoose.createConnection(uriB);

const UserA = connA.model('User', userSchema);
const UserB = connB.model('User', userSchema);
```

### Exemplo bom

```js
await mongoose.connect(uri, {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 10000,
});
```

### Exemplo ruim

```js
// Can cause requests to hang indefinitely on network issues.
await mongoose.connect(uri);
```

### Exemplo

```js
mongoose.connection.on('error', (err) => {
  console.error('Mongo error', err);
});
```

### Exemplo bom

```js
await mongoose.connect(uri, {
  tls: true,
  tlsCAFile: process.env.MONGO_CA_FILE,
});
```

### Exemplo ruim

```js
await mongoose.connect(uri, { tls: false });
```

### Exemplo

```js
await mongoose.connect(uri, {
  readPreference: 'primary',
  writeConcern: { w: 'majority', j: true },
});
```

### Exemplo ruim

```js
await mongoose.connect(uri, { writeConcern: { w: 0 } });
```

### Exemplo bom

```js
await mongoose.connect(uri, { bufferCommands: false });
```

### Exemplo ruim

```js
// Default buffering can mask failures for a long time.
await mongoose.connect(uri);
```

### Exemplo ruim

```js
// This can double-insert if the first write actually succeeded.
await Orders.create({ orderId, total });
```

## Referencias

- Versao para IA: ../../ai/chapters/02-connections-and-topology.md
- Capitulo original: ../../chapters/02-connections-and-topology.md
