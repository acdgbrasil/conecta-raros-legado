# 20 - Referencia Rapida e Checklists (PT-BR)
<a id="pt-br"></a>

Conteudo adaptado de:
- [aux_1/mongoose-ai-docs/18-referencia-rapida.md](../../../aux_1/mongoose-ai-docs/18-referencia-rapida.md)
- [aux_1/mongoose-ai-docs/19-checklists-globais.md](../../../aux_1/mongoose-ai-docs/19-checklists-globais.md)

## Referencia rapida

### Query helpers

- `select("campo")` reduz payload.
- `lean()` evita hidratacao.
- `limit(n)` protege pagina.
- `sort({ createdAt: -1 })` ordena.
- `populate("ref", "campo")` resolve referencias.

### Updates

- `findOneAndUpdate(filter, update, { new: true, runValidators: true })`.
- Operadores comuns: `$set`, `$inc`, `$push`, `$pull`, `$addToSet`.

### Schema options

- `timestamps: true` adiciona `createdAt` e `updatedAt`.
- `strict: "throw"` bloqueia campos extras.
- `toJSON: { virtuals: true }` inclui virtuais.

### Indices

- `schema.index({ campo: 1 })`.
- `unique: true` cria indice unico.
- `schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })` para TTL.

### Tipos

- `InferSchemaType<typeof schema>` para tipar documentos.
- `HydratedDocument<Type>` quando precisa de metodos.

### Checklist

- `lean` usado quando nao precisa de methods?
- `runValidators` em updates?
- Indices revistos para queries reais?

## Checklists globais

### Checklist de schema

- Campos criticos com `required`?
- `enum` para dominios finitos?
- `timestamps` habilitado?
- `strict` definido de forma consciente?

### Checklist de leitura

- `select` reduz dados?
- `limit` aplicado?
- `lean` quando nao precisa de document methods?

### Checklist de escrita

- `runValidators` em updates?
- Uso de operadores `$set`, `$inc`?
- Controle de duplicidade (`E11000`)?

### Checklist de seguranca

- `tenantId` em todas queries multi-tenant?
- Dados sensiveis excluidos do `toJSON`?
- Logs sem dados sensiveis?

### Checklist de performance

- Indices baseados em queries reais?
- `autoIndex` desativado em producao?
- Evita `populate` sem selecao de campos?

---

<a id="en"></a>

# English Version

## Quick reference

### Query helpers

- `select("field")` reduces payload.
- `lean()` avoids hydration.
- `limit(n)` protects pagination.
- `sort({ createdAt: -1 })` orders results.
- `populate("ref", "field")` resolves references.

### Updates

- `findOneAndUpdate(filter, update, { new: true, runValidators: true })`.
- Common operators: `$set`, `$inc`, `$push`, `$pull`, `$addToSet`.

### Schema options

- `timestamps: true` adds `createdAt` and `updatedAt`.
- `strict: "throw"` blocks extra fields.
- `toJSON: { virtuals: true }` includes virtuals.

### Indexes

- `schema.index({ field: 1 })`.
- `unique: true` creates a unique index.
- `schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })` for TTL.

### Types

- `InferSchemaType<typeof schema>` to type documents.
- `HydratedDocument<Type>` when you need methods.

### Checklist

- `lean` used when you do not need methods?
- `runValidators` in updates?
- Indexes reviewed for real queries?

## Global checklists

### Schema checklist

- Critical fields with `required`?
- `enum` for finite domains?
- `timestamps` enabled?
- `strict` intentionally defined?

### Read checklist

- `select` reduces data?
- `limit` applied?
- `lean` when you do not need document methods?

### Write checklist

- `runValidators` in updates?
- Use of `$set`, `$inc` operators?
- Duplicate control (`E11000`)?

### Security checklist

- `tenantId` in all multi-tenant queries?
- Sensitive data excluded from `toJSON`?
- Logs without sensitive data?

### Performance checklist

- Indexes based on real queries?
- `autoIndex` disabled in production?
- Avoid `populate` without field selection?
