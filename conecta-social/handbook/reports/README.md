# Reports & Logs

Central de registro histórico das evoluções, auditorias e decisões técnicas do Conecta Social.

## ✅ Objetivos
- Manter rastreabilidade de mudanças relevantes (breaking changes, arquitetura, governança).
- Documentar auditorias de dados e LGPD de forma contínua.
- Servir como memória técnica para decisões, riscos e planos de ação.

## 📂 Estrutura
- `daily_reports/` — Resumo diário das mudanças (últimos 30 dias).
- `data_maturity_audits/` — Auditorias de maturidade de dados (MMD/DAMA-DMBOK).
- `lgpd_audits/` — Auditorias LGPD e relatórios de risco.
- `postgres_audits/` — Auditorias de schema e performance no Postgres.
- `mongodb_audits/` — Auditorias legadas do MongoDB.
- `planning/` — Roadmaps e planos de melhoria.
- `archive/` — Histórico arquivado (relatórios antigos e encerrados).

## 🧭 Regras de Organização
- **Ativo vs Arquivo:** relatórios com ações pendentes ficam fora de `archive/`. Concluídos ou antigos vão para `archive/`.
- **Daily Reports:** mantenha apenas os últimos 30 dias em `daily_reports/`.
- **Quebra de compatibilidade:** sempre gerar relatório no mesmo dia (auditoria ou daily report).

## 🏷️ Padrões de Nome
- Auditorias: `YYYY-MM-DD-<escopo>-audit.md`
- Daily Reports: `YYYY-MM-DD-daily-report.md`
- Migrações/Refactors: `YYYY-MM-DD-<tema>.md`

## 🧪 Quando criar novos relatórios
- Nova arquitetura, troca de framework ou alteração de protocolo HTTP.
- Mudanças em regras de privacidade, LGPD, ou manipulação de PII.
- Alterações significativas em schema (Postgres/MongoDB).
- Quebra de endpoints ou mudanças de contrato.

## 📌 Histórico Recente
- **[2026-02-03] Reauditoria Completa**: IAM BFF, LGPD, Postgres e MongoDB (revalidação).
- **[2026-02-03] Resumo Executivo**: Auditoria completa com todos os agentes.
- **[2026-02-03] IAM BFF & Erros HTTP**: padronização de respostas, cookies seguros e auditorias de maturidade/LGPD.
- **[2026-01-23] Auditoria de Erros e Segurança**: riscos no OTP e serialização de erros.
- **[2026-01-20] Monorepo Refactor (IAM & Notifications)**: migração para Bun e arquitetura modular. (Arquivado)
