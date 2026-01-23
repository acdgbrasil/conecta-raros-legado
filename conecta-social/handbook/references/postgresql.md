# PostgreSQL & Bun SQL

Utilizamos o driver nativo do Bun para interações com o banco.

## 🛡️ Segurança (Anti-SQL Injection)
É terminantemente proibido o uso de template strings normais para queries. Use sempre a tag function `pg`:

```typescript
// ✅ CORRETO (Parametrizado automaticamente)
await pg`SELECT * FROM users WHERE id = ${id}`;

// ❌ INCORRETO (Vulnerável)
await pg(`SELECT * FROM users WHERE id = ${id}`);
```

## Migrações
Atualmente as migrações são arquivos `.ts` que utilizam comandos DDL diretos.
Localização: `src/modules/shared/infra/postgres/migrations/`.

## Performance
Utilizamos Window Functions (`COUNT(*) OVER()`) para realizar paginação e contagem total em uma única viagem ao banco de dados (Round-trip).
