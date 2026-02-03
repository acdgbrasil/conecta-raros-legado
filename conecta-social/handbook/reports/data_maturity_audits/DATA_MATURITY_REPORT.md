# Relatório de Maturidade de Dados - Conecta Social

**Data:** 03/02/2026
**Responsável:** Data-Maturity-Reviewer
**Escopo:** Módulos `iam`, `shared`, `notifications` (excluindo legado `social`)
**Status Geral:** 🟢 Nível 3 - Definido (com pontos de atenção em privacidade)

---

## 1. Resumo Executivo

A arquitetura atual mantém validação forte via Zod e reforça o padrão de respostas HTTP com mapeamento de erros estruturados no BFF do IAM. O uso de Bun Native (`Bun.serve`) com rotas planas melhora a previsibilidade operacional. Ainda há riscos de privacidade em logs de notificações e uma dependência frágil de `JSON.parse(error.message)` para erros de validação.

Evidências principais:
- BFF IAM e rotas `Bun.serve` consolidadas: `src/server-bun.ts:1-69`
- Mapeamento central de erros e status HTTP: `src/modules/iam/application/mappers/auth/error/auth.error.ts:1-176`
- BFF web/mobile e cookies seguros: `src/modules/iam/interface/http/bff/web/controllers/auth/login.web.controller.ts:1-43` e `src/modules/iam/interface/http/bff/web/controllers/auth/refresh.web.controller.ts:1-36`

---

## 2. Avaliação por Dimensão

### DIMENSÃO: Conhecimento sobre os Dados
**Nível Atual:** 3 (Definido)

| ID | Tema | Nível | Evidência no Código | Como ir para o Próximo Nível (Good vs Bad) |
|--- |--- |--- |--- |--- |
| 5.1 | Documentação dos Ativos | 3 | Padrões de mapper/outputs consolidados no IAM (`AuthMapper`) e rotas explícitas por BFF. | **Bad:** Schema sem metadata/describe. **Good:** `zod` com `.meta()` + `.describe()` para gerar glossário e OpenAPI. |
| 5.2 | Glossário de Negócio | 3 | Enum de códigos de erro e payloads estruturados (`AuthSecurityErrorCode`). | **Bad:** `code: string` solto. **Good:** `AuthSecurityErrorCode` com descrição. |

Referências:
- `handbook/quality/governance/DATA_DICTIONARY_GUIDE.md:1-57`
- `handbook/tooling/zod/documentation/meta_data.md:162-178`

### DIMENSÃO: Qualidade de Dados
**Nível Atual:** 3 (Definido) ⚠️ *Atenção em serialização*

| ID | Tema | Nível | Evidência no Código | Como ir para o Próximo Nível (Good vs Bad) |
|--- |--- |--- |--- |--- |
| 11.1 | Gestão de Qualidade | 3 | Schemas Zod centralizados em `AuthMapper` e validação explícita. | **Bad:** `z.string()` sem regra. **Good:** `z.string().email()` com refinements. |
| 11.3 | Medição e Controle | 3 | Erros retornados em payload estruturado, mas dependem de `JSON.parse(error.message)` para Zod. | **Bad:** `return error.message` (string). **Good:** `if (error instanceof ZodError) return { issues: error.issues }`. |

Referências:
- `handbook/quality/governance/DATA_QUALITY_GUIDE.md:1-67`
- `src/modules/iam/application/mappers/auth/error/auth.error.ts:58-165`

### DIMENSÃO: Ética e Privacidade
**Nível Atual:** 2 (Básico) ⚠️ *Risco Crítico mantém*

| ID | Tema | Nível | Evidência no Código | Como ir para o Próximo Nível (Good vs Bad) |
|--- |--- |--- |--- |--- |
| 10.1 | Ética e Tratamento | 2 | BFF web remove refresh token do body (cookie HttpOnly) e mantém minimização. | **Bad:** retornar objeto completo do usuário. **Good:** retornar apenas `accessToken` + `user` filtrado. |

Referências:
- `handbook/quality/governance/DATA_PRIVACY_GUIDE.md:1-69`
- `src/modules/iam/interface/http/bff/web/controllers/auth/login.web.controller.ts:17-38`

### DIMENSÃO: Ciclo de Vida e Auditoria
**Nível Atual:** 3 (Definido)

| ID | Tema | Nível | Evidência no Código | Como ir para o Próximo Nível (Good vs Bad) |
|--- |--- |--- |--- |--- |
| - | Auditoria e Rastreio | 3 | Sem mudanças recentes em deletes/soft delete. | **Bad:** `DELETE` físico. **Good:** soft delete + auditoria. |

Referências:
- `handbook/quality/governance/DATA_LIFECYCLE_GUIDE.md:1-72`

---

## 3. Plano de Ação Imediato

1. **[MÉDIO]** Substituir `JSON.parse(error.message)` por `ZodError.issues` quando aplicável.
2. **[MÉDIO]** Ampliar metadados `.meta()`/`.describe()` nos schemas para reforçar glossário.
3. **[CRÍTICO]** Sanear logs de PII no módulo de notificações (risco histórico ainda aberto).

---
*Relatório atualizado em 03/02/2026.*
