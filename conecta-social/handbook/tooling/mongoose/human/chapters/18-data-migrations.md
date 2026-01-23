# 18 - Migracoes de dados

## Objetivo

Orientar migracoes idempotentes e seguras em lote.

## Conceitos principais

- Migracoes devem poder rodar mais de uma vez.
- Processamento em lote reduz consumo de memoria.
- Bulk operations aceleram atualizacoes.

## Quando usar

- Ao alterar schema ou backfill de dados.
- Para corrigir dados inconsistentes.

## Armadilhas comuns

- Carregar colecoes inteiras em memoria.
- Nao registrar progresso.
- Nao testar em ambiente realista.

## Checklist humano

- Idempotencia validada.
- Lotes e logs configurados.
- Rollback ou reexecucao planejada.

## Exemplos e reforco

### Exemplo bom

```js
// Processar em lotes com cursor
const cursor = User.find({ status: { $exists: false } }).cursor();
for await (const doc of cursor) {
  await User.updateOne({ _id: doc._id }, { $set: { status: "active" } });
}
```

### Exemplo

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

### Exemplo ruim

```js
// Carregar tudo na memoria
const users = await User.find({ status: { $exists: false } });
for (const u of users) {
  u.status = "active";
  await u.save();
}
```

### Exemplo bom

```js
// Process in batches with a cursor
const cursor = User.find({ status: { $exists: false } }).cursor();
for await (const doc of cursor) {
  await User.updateOne({ _id: doc._id }, { $set: { status: "active" } });
}
```

### Exemplo

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

### Exemplo ruim

```js
// Load everything in memory
const users = await User.find({ status: { $exists: false } });
for (const u of users) {
  u.status = "active";
  await u.save();
}
```

## Referencias

- Versao para IA: ../../ai/chapters/18-data-migrations.md
- Capitulo original: ../../chapters/18-data-migrations.md
