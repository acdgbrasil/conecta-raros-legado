# 🔐 IAM API Reference

Endpoints de autenticação via BFF web/mobile, montados sob o prefixo `/iam`.

## BFF Web

### Login (`POST /iam/web/auth/login`)
Retorna `accessToken` e `user`. O `refreshToken` é enviado em cookie `HttpOnly`.

```bash
curl -X POST http://localhost:3000/iam/web/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "admin@conectasocial.com.br", "password": "secure_password" }'
```

### Refresh (`POST /iam/web/auth/refresh`)
Rotaciona o refresh token via cookie e devolve novo `accessToken`.

```bash
curl -X POST http://localhost:3000/iam/web/auth/refresh \
  -H "Content-Type: application/json"
```

---

## BFF Mobile

### Login (`POST /iam/mobile/login`)
Retorna `accessToken`, `refreshToken` e `user`.

```bash
curl -X POST http://localhost:3000/iam/mobile/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "admin@conectasocial.com.br", "password": "secure_password" }'
```

### Refresh (`POST /iam/mobile/refresh`)
Rotaciona o refresh token enviado no payload.

```bash
curl -X POST http://localhost:3000/iam/mobile/refresh \
  -H "Content-Type: application/json" \
  -d '{ "refreshToken": "YOUR_REFRESH_TOKEN" }'
```
