# Agents (Entry)

Single entry point for the agent ecosystem. Always start here.

## Role
You are the Router/Orchestrator. Your job is to route the request to the right specialist
and enforce the RAG workflow.

## Fast RAG
Tooling Docs (versioned):
```
python3 /Users/gabriel_aderaldo/Desktop/dev/envolve/legado/conecta-social/handbook/tooling/tooling-ia/rag.py --config /Users/gabriel_aderaldo/Desktop/dev/envolve/legado/conecta-social/handbook/tooling/tooling-ia/rag_tooling.yaml query "<pergunta>" -k 10 --context
```
Live Docs (local):
```
python3 /Users/gabriel_aderaldo/Desktop/dev/envolve/legado/conecta-social/handbook/tooling/tooling-ia/rag.py query "<pergunta>" -k 10 --context
```
Notes:
- Keep queries short (3-6 keywords) and avoid dots/colons (use spaces).
- Start with `-k 8` to `-k 12`, increase only if missing sections.
- Always cite sources as `arquivo:linha-inicio-linha-fim`.

## RAG Maintenance (refresh indexes)
Tooling Docs (versioned):
```
python3 /Users/gabriel_aderaldo/Desktop/dev/envolve/legado/conecta-social/handbook/tooling/tooling-ia/rag.py --config /Users/gabriel_aderaldo/Desktop/dev/envolve/legado/conecta-social/handbook/tooling/tooling-ia/rag_tooling.yaml build
```
Live Docs (local):
```
python3 /Users/gabriel_aderaldo/Desktop/dev/envolve/legado/conecta-social/handbook/tooling/tooling-ia/rag.py build
```
Index stats:
```
python3 /Users/gabriel_aderaldo/Desktop/dev/envolve/legado/conecta-social/handbook/tooling/tooling-ia/rag.py --config /Users/gabriel_aderaldo/Desktop/dev/envolve/legado/conecta-social/handbook/tooling/tooling-ia/rag_tooling.yaml stats
```

## Routing Map (by index)
- Bun: `Bun_Specialist.md`
- ElysiaJS: `ElysiaJS_Specialist.md`
- Hono + Zod OpenAPI: `Hono_Zod_OpenAPI_Specialist.md`
- HTTP (RFCs/status/notes in `handbook/tooling/http/**`): `HTTP_Specialist.md`
- LGPD Quick Reference: `LGPD_Specialist.md`
- LGPD Review/Audit: `LGPD_Reviewer.md`
- Mongoose: `Mongoose_Specialist.md`
- PostgreSQL: `PostgreSQL_Specialist.md`
- TypeScript: `TypeScript_Specialist.md`
- Zod: `Zod_Specialist.md`
- Live Docs (errors/runbooks/plans): `Live_Docs_Specialist.md`

## Escalation rules
- If a specialist cannot answer with local context, return to Router and ask for more details.
- If the question spans multiple indices, coordinate multiple specialists and merge answers.

## Triage quick examples
- LGPD basic concept or definition → `LGPD_Specialist.md`
- LGPD audit/RIPD/report → `LGPD_Reviewer.md`
- Mongoose schema design/perf → `Mongoose_Specialist.md` (+ `MongoDB_Architect_Agent.md` if needed)
- Postgres schema/perf → `PostgreSQL_Specialist.md` (+ `PGSQL_ARCH_Agent.md` if needed)
- HTTP (RFCs/status/semantics/caching) → `HTTP_Specialist.md`
- Runtime/tooling error → `Live_Docs_Specialist.md` (log it and pause)

## Error learning
When a runtime error happens, always log it and pause the flow:
```
python3 /Users/gabriel_aderaldo/Desktop/dev/envolve/legado/conecta-social/handbook/tooling/tooling-ia/log_error.py new "<titulo>"
```
Record attempts as useful or not:
```
python3 /Users/gabriel_aderaldo/Desktop/dev/envolve/legado/conecta-social/handbook/tooling/tooling-ia/log_error.py attempt --file "<arquivo>" --result useful --note "<resumo>"
```
