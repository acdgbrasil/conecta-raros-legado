# Auditoria de Maturidade de Dados - Conecta Social

Este diretório contém os relatórios periódicos de auditoria técnica sobre a governança e maturidade dos dados do projeto, baseados no Modelo de Maturidade de Dados (MMD).

## Estrutura dos Relatórios
Os relatórios devem seguir o padrão de nomeação: `YYYY-MM-DD-escopo-auditoria.md`.

Exemplo: `2026-01-22-iam-notifications-audit.md`

## O que deve constar em um relatório?
1.  **Resumo Executivo:** Visão geral do estado dos dados no escopo analisado.
2.  **Mapeamento de Pontos Críticos:** Falhas de tipagem, documentação ausente ou riscos de privacidade.
3.  **Avaliação por Pilares (MMD):**
    - Conhecimento sobre os Dados (Glossário/Metadados).
    - Qualidade de Dados (Validação/Semântica).
    - Ética e Privacidade (Minimização/Sanitização).
    - Ciclo de Vida (Auditoria/Descarte).
4.  **Plano de Ação:** Recomendações de refatoração para atingir o próximo nível de maturidade.

## Relatórios Gerados
- `2026-01-22-iam-notifications-audit.md`: Auditoria inicial dos módulos IAM e Notifications.
