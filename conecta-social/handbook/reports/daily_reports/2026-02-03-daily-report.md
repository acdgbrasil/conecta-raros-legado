# Daily Report - 03/02/2026

## 📋 Atividades Realizadas
- **Reestruturação HTTP do IAM:** Remoção do servidor Bun legado e criação do BFF (web/mobile) com rotas dedicadas.
- **Padronização de respostas e erros:** Novo `authHttpErrorMapper` com payloads estruturados e mapeamento de status HTTP.
- **Infra de DI:** Introdução do container `GetIt` e tokens de injeção para use cases do IAM.
- **HTTP Status centralizado:** Catálogo tipado de status e mensagens para uso consistente nas respostas.

## 🚀 Evolução Técnica
- **Segurança de sessão:** Refresh token em cookie `HttpOnly` + `Secure` + `SameSite=Strict` no BFF web.
- **Qualidade de erros:** Respostas de validação mais previsíveis para front-end (JSON estruturado).

## ⚠️ Impedimentos e Desafios
- O `authErrorMapper` depende de `error.message` em JSON; se o payload vier diferente, cai em erro genérico.

## 📅 Próximos Passos
- Revisar padronização de erros para não depender de `JSON.parse` em `error.message`.
- Consolidar testes de rotas do novo BFF web/mobile.
