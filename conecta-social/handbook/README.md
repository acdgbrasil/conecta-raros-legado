# Handbook — Conecta Social API

O handbook consolida o conhecimento estratégico, decisões técnicas e rituais operacionais da API do Conecta Social. Este é um **Monólito Modular (Monorepo)** construído sobre o runtime **Bun**, focado em performance, DX (Developer Experience) e manutenibilidade.

## 🏗 Estrutura do Sistema (Monorepo)
A API é organizada como um workspace do Bun, onde cada módulo funcional é um pacote isolado (`@modules/*`):

- **IAM (`@modules/iam`)**: Gestão de identidades, autenticação e autorização.
- **Notifications (`@modules/notifications`)**: Orquestrador de mensageria.
- **Shared (`@modules/shared`)**: Kernel compartilhado (banco, validações, eventos).
- **Social (`@modules/social`)**: ⚠️ **LEGADO/DESATIVADO**. Em refatoração lenta.

## 📚 Seções do Handbook
- `principles/` — Clean Architecture, DDD e Event-Driven Design.
- `domain_questions/` — Bounded Contexts de IAM e Notificações.
- `codebase/` — Padrões de nomenclatura, Zod v4 e Mappers.
- `quality/` — Critérios de pronto, auditoria e segurança SQL.
- `tooling/` — **(Atualizado)** Guia completo do Bun (Workspaces, Catalogs, Bunfig).
- `references/` — Esquemas de banco e padrões de API.
- `reports/` — Registros de progresso, refatorações e [Roadmap de Maturidade](./reports/roadmap.md).
