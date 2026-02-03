# Auditoria de Maturidade de Dados: IAM BFF & Camada HTTP

**Data:** 03/02/2026
**Responsável:** Data-Maturity-Reviewer (com suporte dos especialistas HTTP, Zod e TypeScript)
**Escopo:** IAM BFF (web/mobile), mapeamento de erros e roteamento Bun Native

## 1. Resumo Executivo
A nova camada BFF do IAM introduz respostas estruturadas e padroniza o uso de status HTTP, elevando a previsibilidade para o front-end. A estrutura de rotas com `Bun.serve` e `prefixRoutes` torna os endpoints explícitos e estáveis. O principal risco técnico é a dependência de `JSON.parse(error.message)` para errors de validação, que pode degradar a padronização em casos não-Zod.

## 2. Evidências no Código
- Bootstrapping e roteamento Bun Native: `src/server-bun.ts:1-69`
- Rotas do BFF (web/mobile) e prefixos: `src/modules/iam/interface/http/router/iam.router.ts:1-18`
- Controllers web/mobile: `src/modules/iam/interface/http/bff/web/controllers/auth/login.web.controller.ts:1-43`, `src/modules/iam/interface/http/bff/web/controllers/auth/refresh.web.controller.ts:1-36`, `src/modules/iam/interface/http/bff/mobile/controllers/login.mobile.controller.ts:1-21`, `src/modules/iam/interface/http/bff/mobile/controllers/refresh.mobile.controller.ts:1-21`
- Mapeamento de erros e status: `src/modules/iam/application/mappers/auth/error/auth.error.ts:1-176`

## 3. Avaliação por Pilar (MMD)

### 3.1 Qualidade de Dados (Nível 3)
- **Ponto Forte:** Payloads de erro padronizados (`code`, `message`, `details`) melhoram a legibilidade das falhas.
- **Risco:** O parsing de `error.message` é frágil para mensagens não JSON.

**Referência:** `handbook/quality/governance/DATA_QUALITY_GUIDE.md:1-67`

### 3.2 Conhecimento sobre os Dados (Nível 3)
- **Ponto Forte:** Rotas e BFFs explicitam o contrato `/iam/web/*` e `/iam/mobile/*`.

**Referência:** `handbook/quality/governance/DATA_DICTIONARY_GUIDE.md:1-57`

### 3.3 Ética e Privacidade (Nível 3)
- **Ponto Forte:** Refresh token no web fica restrito a cookie `HttpOnly`/`Secure`/`SameSite=Strict`.

**Referência:** `handbook/quality/governance/DATA_PRIVACY_GUIDE.md:1-69`

### 3.4 Interoperabilidade (Nível 3)
- **Ponto Forte:** Status HTTP alinhados com semântica de 400/401/403/405 e payloads consistentes.

**Referência:** `handbook/tooling/http/http_status.md:77-95`

## 4. Recomendações
1. **Substituir parsing por ZodError:** Quando `error` for `ZodError`, usar `error.issues` diretamente.
2. **Adicionar testes de contrato:** Testes para `login` e `refresh` garantindo shape de erro e status.

---
*Auditoria emitida em 03/02/2026.*
