# IAM Auth Module (Bun Native)

Este módulo implementa a autenticação completa usando apenas tecnologias nativas do Bun (sem frameworks externos como Express ou Hono no runtime principal).

## 🚀 Como Rodar

```bash
# 1. Configurar variáveis de ambiente (.env)
cp example.env .env

# 2. Configurar o Banco de Dados (Postgres)
bun run db:setup

# 3. Iniciar o Servidor
bun start
```

## 🔐 Endpoints de Autenticação

A URL base é `http://localhost:3000`.

### 1. Login
**POST** `/auth/login`
```json
{
  "email": "admin@conecta.com",
  "password": "sua_senha"
}
```
**Resposta (200):**
```json
{
  "accessToken": "ey...",
  "refreshToken": "ey...",
  "user": { ... }
}
```

### 2. Recuperação de Senha
**POST** `/auth/forgot-password`
```json
{
  "email": "seu@email.com"
}
```
*Dispara um e-mail com o código OTP via Resend.*

### 3. Redefinir Senha
**POST** `/auth/reset-password`
```json
{
  "email": "seu@email.com",
  "code": "123456",
  "newPassword": "NovaSenhaForte!1"
}
```

### 4. Refresh Token
**POST** `/auth/refresh`
```json
{
  "refreshToken": "ey..."
}
```

## 🏗️ Arquitetura Interna

*   **Server:** Micro-Kernel em `src/modules/shared/http` (Router Nativo + Zod Validation).
*   **Providers:**
    *   `BunJwtProvider` (Web Crypto API)
    *   `BunPasswordHasher` (Argon2id Nativo)
    *   `BunEventBus` (EventTarget Nativo)
    *   `ResendNotificationProvider` (Fetch Nativo)
*   **Clean Arch:** UseCases puros injetados via `IamModule.ts`.

## 🧪 Testes

Os testes de API estão localizados em `ops/tests/api/IAM/Auth`.
Use o **Bruno** para executá-los.
