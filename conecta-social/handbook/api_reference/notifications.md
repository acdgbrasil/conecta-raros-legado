# 🔔 Notifications API Reference

Este módulo está previsto sob o prefixo `/notifications` (ainda sem endpoints públicos ativos).

Atualmente atua de forma **reativa** via barramento de eventos interno.

## Endpoints de Webhook (Futuro)

### SendGrid Callback (`POST /notifications/webhooks/sendgrid`)
Endpoint para processar status de entrega.

```bash
curl -X POST http://localhost:3000/notifications/webhooks/sendgrid \
  -H "Content-Type: application/json" \
  -d '{"event": "delivered", "email": "user@example.com"}'
```
