# Quality & Guardrails

Espaço para critérios de pronto, checagens automáticas e políticas de segurança.

## Checklist de Qualidade (Bun/TS)
- [ ] **Linting**: O código deve passar no `biome check` (ou ESLint) sem erros.
- [ ] **Type Safety**: `bun x tsc --noEmit` deve rodar limpo. Nenhum `any` explícito sem justificativa.
- [ ] **Testes**: Novos UseCases devem ter testes unitários cobrindo o caminho feliz e casos de erro.
- [ ] **Segurança SQL**: Nenhuma query com interpolação de string (`${var}`). Apenas `pg`${var}``.

## Governança de Dados (DAMA-DMBOK)
Guias essenciais para garantir a maturidade dos dados:
- [💎 Qualidade de Dados](./governance/DATA_QUALITY_GUIDE.md)
- [📚 Dicionário de Dados](./governance/DATA_DICTIONARY_GUIDE.md)
- [🛡️ Privacidade & LGPD](./governance/DATA_PRIVACY_GUIDE.md)
- [♻️ Ciclo de Vida & Auditoria](./governance/DATA_LIFECYCLE_GUIDE.md)

## Métricas
- Cobertura de testes alvo: 80% nos UseCases.
