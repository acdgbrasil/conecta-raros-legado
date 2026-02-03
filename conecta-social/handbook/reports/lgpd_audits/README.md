# Auditoria LGPD - Conecta Social

Este diretório contém os relatórios periódicos de conformidade com a Lei Geral de Proteção de Dados (LGPD).

## Estrutura dos Relatórios
Os relatórios devem seguir o padrão de nomeação: `YYYY-MM-DD-tipo-auditoria.md`.

Exemplo: `2026-01-22-auditoria-inicial.md`

## O que deve constar em um relatório?
1.  **Escopo da Auditoria:** Quais módulos ou fluxos foram analisados.
2.  **Hipóteses de Tratamento Identificadas:** Base legal utilizada.
3.  **Riscos Identificados:** Tabela de riscos (Probabilidade x Impacto).
4.  **Vulnerabilidades de Privacidade:** Dados expostos, logs indevidos, excesso de coleta.
5.  **Recomendações:** Ações corretivas baseadas no `handbook/tooling/lgpd/guide_lgpd.md`.
6.  **Status do RIPD:** Necessidade de atualização do Relatório de Impacto.

## Histórico
- `2026-01-22-iam-module-audit.md`: Auditoria LGPD do módulo IAM.
- `2026-01-23-iam-pii-audit.md`: Auditoria de segurança e integridade (OTP e PII).
- `2026-02-03-iam-bff-cookies-audit.md`: Auditoria BFF web/mobile com cookies seguros.
