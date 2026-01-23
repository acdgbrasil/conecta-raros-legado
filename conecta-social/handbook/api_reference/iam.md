# 🔐 IAM API Reference

Endpoints de autenticação e gestão de usuários montados sob o prefixo `/api`.

## Autenticação

### Login (`POST /auth/login`)
Retorna `accessToken` e `refreshToken`.

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{    "email": "admin@conectasocial.com.br",    "password": "secure_password"  }"
```

### Refresh (`POST /auth/refresh`)
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

---

## Gestão de Usuários (Protegido)

### Perfil (`GET /users/me`)
```bash
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer <TOKEN>"
```

### Criar Usuário (`POST /users`)
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{    "name": "Novo Usuário",    "email": "novo@example.com",    "role": "user"  }'
```

---

## Administração (Protegido)

### Alterar Cargo (`PATCH /users/:id/role`)
```bash
curl -X PATCH http://localhost:3000/api/users/<USER_ID>/role \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```
