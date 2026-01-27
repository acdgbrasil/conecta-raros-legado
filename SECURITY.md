# Política de Segurança

Este projeto segue os princípios de **Privacy by Design** e **LGPD** descritos no handbook, com foco em minimização de dados, logs seguros e governança técnica.

## Versões Suportadas

Correções de segurança são fornecidas apenas para a linha principal de desenvolvimento:

| Versão | Suporte            |
| ------ | ------------------ |
| **main**   | :white_check_mark: |
| outras | :x:                |

Se você usa releases com tag, utilize sempre a tag mais recente.

## Reporte de Vulnerabilidade

Por favor, reporte falhas de segurança de forma **privada**. Não abra Issues públicas para vulnerabilidades sensíveis.

### Canal Preferencial
- Abra um **Security Advisory privado** no GitHub deste repositório.

### Informações Recomendadas
Ao reportar, tente incluir:
1. **Descrição do Impacto:** Qual o risco? (ex: vazamento de PII, bypass de autenticação, RCE).
2. **Passos para Reprodução:** Como podemos ver o erro? (ex: script curl, cenário de teste).
3. **Módulo Afetado:** `iam`, `notifications`, `social` ou `infra` (`ops/docker`).
4. **PoC (Proof of Concept):** Se possível, uma demonstração mínima sem dados pessoais reais.

### SLA Esperado
- **Confirmação de recebimento:** até 72 horas.
- **Atualização de status:** até 7 dias.
- **Resolução:** Alinharemos a correção e a janela de divulgação responsável.

## Boas Práticas no Reporte

- ❌ **Não publique** detalhes em issues públicas ou chats abertos.
- ❌ **Não envie** segredos reais (`JWT_SECRET`, chaves de API, senhas, CPFs reais) no relatório. Use dados fictícios (ex: `user@example.com`).
- ✅ **Mascare** dados pessoais se o print/log for necessário.

## Infraestrutura Segura

A infraestrutura do projeto (`ops/docker`) é configurada para minimizar a exposição:
- Bancos de dados não expõem portas publicamente em produção (apenas na rede interna do Docker).
- Logs são sanitizados e rotacionados para evitar vazamento de informações sensíveis (ver `ops/docker/compose.yml`).