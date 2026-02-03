# Relatório de Auditoria LGPD: IAM BFF (Web/Mobile)

**Data:** 03/02/2026
**Responsável:** LGPD-Reviewer
**Escopo:** Fluxos de login/refresh do BFF (web e mobile)
**Status Geral:** 🟢 Conformidade Técnica Mantida (com riscos residuais)

## 1. Resumo Executivo
A nova camada BFF do IAM reforça a proteção de credenciais ao mover o refresh token para cookie seguro no fluxo web e manter payloads minimizados. Não foram identificados logs de PII nos controllers revisados.

## 2. Conformidade e Evidências
- **Segurança (Art. 46):** refresh token em cookie `HttpOnly`/`Secure`/`SameSite=Strict` no login web.
  - Evidência: `src/modules/iam/interface/http/bff/web/controllers/auth/login.web.controller.ts:10-36`
- **Minimização (Art. 6º, III):** login web responde apenas `accessToken` e `user` filtrado, sem expor refresh token no body.
  - Evidência: `src/modules/iam/interface/http/bff/web/controllers/auth/login.web.controller.ts:25-38`
- **Erro estruturado:** respostas com `code`/`message` evitam vazamento de mensagens internas não tratadas.
  - Evidência: `src/modules/iam/application/mappers/auth/error/auth.error.ts:16-155`

## 3. Riscos e Recomendações
- **Risco Residual:** parsing de `error.message` como JSON pode retornar mensagens genéricas e ocultar detalhes válidos ou, em casos não previstos, expor mensagens internas.
  - **Recomendação:** tratar `ZodError` explicitamente e padronizar mensagens.

## 4. Referências de Governança
- Guia de Privacidade e Minimização: `handbook/quality/governance/DATA_PRIVACY_GUIDE.md:1-69`
- Guia LGPD (base legal e ciclo de tratamento): `handbook/tooling/lgpd/guide_lgpd.md:60-115`

---
*Relatório atualizado em 03/02/2026.*
