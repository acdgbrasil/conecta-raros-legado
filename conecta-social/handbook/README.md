# Handbook — Conecta Social API

O handbook consolida o conhecimento estratégico, decisões técnicas e rituais operacionais da API do Conecta Social. Este é um **Monólito Modular (Monorepo)** construído sobre o runtime **Bun**, com roteamento HTTP nativo e foco em performance, DX (Developer Experience) e manutenibilidade.

## 🏗 Estrutura do Sistema (Monorepo)
A API é organizada como um workspace do Bun, onde cada módulo funcional é um pacote isolado (`@modules/*`):

- **IAM (`@modules/iam`)**: Gestão de identidades, autenticação e autorização, com BFF web/mobile.
- **Notifications (`@modules/notifications`)**: Orquestrador de mensageria (fluxo reativo por eventos).
- **Shared (`@modules/shared`)**: Kernel compartilhado (infra, DI, utilidades HTTP, validações).
- **Social (`@modules/social`)**: ⚠️ **LEGADO/DESATIVADO**. Em refatoração lenta.

## 📚 Seções do Handbook
- `principles/` — Princípios de arquitetura (em construção).
- `process/` — Fluxos de engenharia e padrões de execução.
- `domain_questions/` — Bounded Contexts de IAM e Notificações.
- `codebase/` — Padrões de nomenclatura, Zod v4, mappers e HTTP.
- `api_design/` — Regras de design de APIs (OpenAPI/AsyncAPI + governança).
- `api_reference/` — Referência prática de rotas e exemplos de uso.
- `quality/` — Critérios de pronto, auditoria e segurança SQL.
- `tooling/` — **Guia de Tooling (Bun, Zod, HTTP)**. **Esta pasta NÃO deve ser commitada/versionada.**
- `references/` — Convenções de infraestrutura e configurações essenciais.
- `reports/` — Registros de progresso, refatorações e [Roadmap de Maturidade](./reports/planning/roadmap.md).
