# Relatório de Auditoria PostgreSQL: Refactor e Integridade

**Data:** 23/01/2026
**Responsável:** PGSQL_ARCH_Agent
**Escopo:** Módulo IAM (Esquema de Recuperação e Tipagem)

## 1. DDL Refactor (Recovery Codes)
A auditoria confirma a necessidade imediata da migração mapeada no `REPORT_FIX_RECOVERY_CODES.md`.

### 🛑 Erro de Design:
A tabela original usava `email` como chave de busca. No PostgreSQL, buscas por `TEXT` são menos eficientes que por `UUID` (indexado) e quebram se o usuário trocar o e-mail.
- **Veredito:** A migração para `user_id UUID REFERENCES users(id)` é mandatória para garantir integridade referencial e performance.

## 2. Padronização de Timezones
Reitero a recomendação de auditorias anteriores:
- **TIMESTAMPTZ:** Todas as colunas de data (incluindo `expires_at` em `recovery_codes`) devem ser migradas para `TIMESTAMPTZ` para evitar erros de lógica em expiração de tokens devido ao fuso horário do servidor/banco.

## 3. Estratégia de Indexação
Para o `findValidRecoveryCode`, é essencial o índice composto:
`CREATE INDEX idx_recovery_valid_search ON recovery_codes(user_id, code) WHERE used = false;`

---
*Assinado: PostgreSQL Architect Agent*
