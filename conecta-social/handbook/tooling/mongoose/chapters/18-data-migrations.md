# 18 - Migracoes de Dados (PT-BR)
<a id="pt-br"></a>

Conteudo adaptado de `aux_2/mongoose-docs/11-migracoes-dados.md`. Para detalhes completos, veja o arquivo original:
- [aux_2/mongoose-docs/11-migracoes-dados.md](../../../aux_2/mongoose-docs/11-migracoes-dados.md)

## Migracoes e rotinas de dados

Migracoes devem ser idempotentes e executaveis em lote.

### Good examples

```js
// Processar em lotes com cursor
const cursor = User.find({ status: { $exists: false } }).cursor();
for await (const doc of cursor) {
  await User.updateOne({ _id: doc._id }, { $set: { status: "active" } });
}
```

```js
// Bulk write para performance
const ops = items.map(item => ({
  updateOne: {
    filter: { _id: item._id },
    update: { $set: { status: item.status } },
  },
}));
await User.bulkWrite(ops);
```

### Bad examples

```js
// Carregar tudo na memoria
const users = await User.find({ status: { $exists: false } });
for (const u of users) {
  u.status = "active";
  await u.save();
}
```

### Checklist rapido

- A migracao pode rodar duas vezes sem estragar dados?
- Existe limite de lote e controle de memoria?
- Ha log e contagem de alteracoes?

---

<a id="en"></a>

# English Version

## Data migrations

Migrations must be idempotent and runnable in batches.

### Good examples

```js
// Process in batches with a cursor
const cursor = User.find({ status: { $exists: false } }).cursor();
for await (const doc of cursor) {
  await User.updateOne({ _id: doc._id }, { $set: { status: "active" } });
}
```

```js
// Bulk write for performance
const ops = items.map(item => ({
  updateOne: {
    filter: { _id: item._id },
    update: { $set: { status: item.status } },
  },
}));
await User.bulkWrite(ops);
```

### Bad examples

```js
// Load everything in memory
const users = await User.find({ status: { $exists: false } });
for (const u of users) {
  u.status = "active";
  await u.save();
}
```

### Quick checklist

- Can the migration run twice safely?
- Batch limit and memory control?
- Logs and change counts?
