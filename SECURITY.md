# Politica de Seguranca

Este projeto segue os principios de Privacy by Design e LGPD descritos no
handbook, com foco em minimizacao de dados, logs seguros e governanca tecnica.

## Versoes Suportadas

Correcoes de seguranca sao fornecidas apenas para a linha principal:

| Versao | Suporte            |
| ------ | ------------------ |
| main   | :white_check_mark: |
| outras | :x:                |

Se voce usa releases com tag, utilize sempre a tag mais recente.

## Reporte de Vulnerabilidade

Por favor, reporte falhas de seguranca de forma privada.

Canal preferencial:
- Abra um Security Advisory privado no GitHub deste repositorio.

Informacoes recomendadas:
- Descricao do impacto e risco (ex: vazamento de PII, bypass de auth).
- Passos para reproducao e ambiente.
- Modulo afetado (iam, notifications, shared, social).
- Se possivel, uma PoC minima sem dados pessoais reais.

SLA esperado:
- Confirmacao de recebimento em ate 72 horas.
- Atualizacao de status em ate 7 dias.
- Se aceito, alinhamos correcao e janela de divulgacao.
- Se recusado, explicamos o motivo.

## Boas praticas no reporte

- Nao publique detalhes em issues publicas.
- Nao envie segredos reais (`JWT_SECRET`, tokens, emails, CPFs).
- Caso o problema envolva PII, descreva o fluxo sem expor dados.
