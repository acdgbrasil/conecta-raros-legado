# 🔐 IAM — Identity & Access Management

O módulo IAM é o guardião do acesso ao Conecta Social. Ele gerencia quem pode entrar e o que pode fazer.

## Conceitos Chave
- **User**: Entidade central. Possui estado (Active/Inactive) e uma Role.
- **Role**: Agrupamento de permissões.
- **Permissions**: Slugs (ex: `users:write`) que definem capacidades granulares.
- **Refresh Token Rotation**: Técnica de segurança onde cada refresh gera um novo par de tokens, invalidando o anterior.

## Fluxos de Segurança
1. **Recuperação de Senha**: Baseado em códigos OTP de 6 dígitos com expiração curta.
2. **Logout Global**: Ao trocar cargo ou desativar usuário, todas as sessões são revogadas imediatamente.
