# Tooling (RAG Entry)

Use this README as the entry point for all Tooling docs. Each top-level folder has a
short README plus a `RAG_SCOPE.md` that states if it is indexed.

## Quick RAG
Tooling Docs (versioned):
```
python3 /Users/gabriel_aderaldo/Desktop/dev/envolve/legado/conecta-social/handbook/tooling/tooling-ia/rag.py --config /Users/gabriel_aderaldo/Desktop/dev/envolve/legado/conecta-social/handbook/tooling/tooling-ia/rag_tooling.yaml query "<pergunta>" -k 10 --context
```
Live Docs (local):
```
python3 /Users/gabriel_aderaldo/Desktop/dev/envolve/legado/conecta-social/handbook/tooling/tooling-ia/rag.py query "<pergunta>" -k 10 --context
```

## Folders
- `bun/` (runtime, pm, tests)
- `ElysiaJS/` (framework docs)
- `hono-zod-openAPI/` (Hono + Zod OpenAPI)
- `http/` (HTTP status)
- `lgpd/` (LGPD guide)
- `mongoose/` (AI-optimized Mongoose docs)
- `postgresql/` (PostgreSQL docs)
- `typescript/` (TypeScript handbook)
- `zod/` (Zod docs)
- `ai-docs/` (local, non-versioned)
- `ai-docs.template/` (templates)
- `tooling-ia/` (RAG scripts/configs)

## Meta
Guides and maps live in `handbook/tooling/_meta/`:
- `handbook/tooling/_meta/INDEX.md`
- `handbook/tooling/_meta/RAG_GUIDE.md`
- `handbook/tooling/_meta/RAG_MAP.md`
- `handbook/tooling/_meta/ADDING_DOCS.md`
