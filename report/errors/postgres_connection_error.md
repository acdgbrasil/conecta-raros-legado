# Relatório de Erro: Postgres Connection Closed (Bun.sql)

**Data:** 23/01/2026
**Componente:** Backend (Bun) -> Postgres 18
**Driver:** `bun:sql` (Nativo)

## Sintoma
O backend inicia, carrega os módulos, mas falha ao tentar executar a query de teste `SELECT 1` no Postgres. O erro ocorre instantaneamente na inicialização.

## Log do Erro (Stack Trace)

```
conecta-backend   | ❌ Postgres Connection Failed: 166 |   let delimiter = type === "BOX" ? ";" : ",";
conecta-backend   | 167 |   return `{${values.map(arrayValueSerializer.bind(this, type, isPostgresNumericType(type), isPostgresJsonType(type))).join(delimiter)}}`;
conecta-backend   | 168 | }
conecta-backend   | 169 | function wrapPostgresError(error) {
conecta-backend   | 170 |   if (Error.isError(error))
conecta-backend   | 171 |   return new PostgresError(error.message, error);
conecta-backend   |                ^
conecta-backend   | PostgresError: Connection closed
conecta-backend   |  code: "ERR_POSTGRES_CONNECTION_CLOSED"
conecta-backend   | 
conecta-backend   |       at wrapPostgresError (internal:sql/postgres:171:10)
conecta-backend   |       at #onClose (internal:sql/postgres:347:30)
```

## Logs do Postgres (Correlacionados)

```
conecta-postgres  | 2026-01-23 00:35:14.208 UTC [44] LOG:  database system is ready to accept connections
...
conecta-postgres  | sh: locale: not found
conecta-postgres  | 2026-01-23 00:35:13.950 UTC [38] WARNING:  no usable system locales were found
```

## Análise Preliminar

1.  **Origem:** O erro vem de `internal:sql/postgres`, que é o código interno do runtime Bun para o driver Postgres.
2.  **Natureza:** `ERR_POSTGRES_CONNECTION_CLOSED` indica que o socket TCP foi fechado abruptamente.
3.  **Hipóteses:**
    *   O driver `bun:sql` pode estar tentando usar uma feature não suportada ou deprecada no protocolo do PG 18.
    *   Problema de SSL/TLS implícito (o driver tentando SSL e o banco recusando ou vice-versa).
    *   O aviso de `locale` no Postgres Alpine pode estar causando um comportamento inesperado na formatação de mensagens de erro ou handshake inicial, embora seja menos provável que cause o fechamento da conexão.

## Ações Tentadas
- Downgrade para Postgres 16 (mesmo erro persistiu).
- Verificação de variáveis de ambiente (parecem corretas).

## Próximos Passos Sugeridos para Investigação Manual
1.  Testar conexão usando `psql` dentro do container do backend para isolar se é rede ou driver.
2.  Adicionar `?sslmode=disable` ou `?sslmode=require` na connection string do `postgres.client.ts`.
3.  Verificar issues no repositório do Bun sobre compatibilidade com Postgres Alpine.
