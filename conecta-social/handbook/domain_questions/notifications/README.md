# 🔔 Notifications Domain

O domínio de notificações é responsável por **entregar mensagens** aos usuários através de múltiplos canais, desacoplando o "quê" (evento de negócio) do "como" (detalhe de envio).

## Conceitos Chave
- **Dispatcher**: O orquestrador que decide qual provedor usar.
- **Provider**: Implementação concreta de um canal (ex: `ResendProvider`, `ConsoleProvider`).
- **Template**: O corpo da mensagem (atualmente hardcoded, futuro suporte a templates dinâmicos).

## Fluxo
1. Um evento ocorre (ex: `UserCreated`).
2. Um Handler escuta esse evento (`UserCreated.handler.ts`).
3. O Handler invoca o Caso de Uso `SendNotification`.
4. O Caso de Uso chama o `NotificationDispatcher`.
5. O Dispatcher usa a estratégia configurada para enviar o e-mail/SMS.

## Decisões Técnicas
- **Strategy Pattern**: Permite trocar de SendGrid para Resend (ou console.log) sem alterar uma linha de código dos casos de uso.