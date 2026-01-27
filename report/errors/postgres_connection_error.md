# Relatório de Erro: Postgres Connection Closed (Bun.sql)

**Data:** 23/01/2026
**Status:** ✅ **RESOLVIDO** (27/01/2026)
**Componente:** Backend (Bun) -> Postgres 18
**Driver:** `bun:sql` (Nativo)

## Resolução (Update 27/01/2026)
O problema foi corrigido com a padronização das variáveis de ambiente no `ops/docker/compose.yml`.
- **Causa Raiz:** O driver `bun:sql` (arquivo `postgres.client.ts`) esperava variáveis com prefixo `PG_*` (ex: `PG_USER`), mas o Docker Compose antigo passava apenas `POSTGRES_USER`. Isso resultava em uma string de conexão malformada (`postgres://:@:/`) que causava o fechamento imediato da conexão.
- **Correção:** O novo arquivo `ops/docker/compose.yml` faz o mapeamento explícito:
  ```yaml
  environment:
    - PG_USER=${POSTGRES_USER:-postgres}
    - PG_PASSWORD=${POSTGRES_PASSWORD:-postgres}
    # ...
  ```

---

## Histórico do Erro

### Sintoma
O backend inicia, carrega os módulos, mas falha ao tentar executar a query de teste `SELECT 1` no Postgres. O erro ocorre instantaneamente na inicialização.

### Log do Erro (Stack Trace)
```
conecta-backend   | PostgresError: Connection closed
conecta-backend   |  code: "ERR_POSTGRES_CONNECTION_CLOSED"
```

### Logs do Postgres (Correlacionados)
```
conecta-postgres  | 2026-01-23 00:35:14.208 UTC [44] LOG:  database system is ready to accept connections
```

### Análise Original
1.  **Origem:** O erro vem de `internal:sql/postgres`.
2.  **Natureza:** `ERR_POSTGRES_CONNECTION_CLOSED`.