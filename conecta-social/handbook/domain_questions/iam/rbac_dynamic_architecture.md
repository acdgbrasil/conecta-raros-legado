# RBAC Dynamic Architecture: System Permissions & Dynamic Roles

## 1. Contexto e Objetivo
Mover o sistema IAM de um modelo de roles estáticas ou permissões soltas para um modelo de **RBAC Dinâmico** robusto.
O objetivo é permitir que administradores criem cargos (Roles) personalizados combinando permissões fundamentais oferecidas pelo sistema (System Permissions).

---

## 2. Conceitos Fundamentais

### A. System Permissions (Core)
São as "capacidades funcionais" hardcoded no software. Elas representam endpoints, serviços ou ações atômicas que o código sabe executar.
*   **Natureza:** Imutável em tempo de execução (depende de deploy).
*   **Localização:** Camada de Domínio (`src/modules/iam/domain/permission/SystemPermissions.ts`).
*   **Exemplo:** `users:create`, `reports:view`.

### B. Dynamic Roles (Agregado)
São agrupamentos lógicos de permissões criados para refletir a hierarquia da empresa.
*   **Natureza:** Mutável pelo SuperAdmin (exceto System Roles).
*   **Regras de Domínio:**
    1.  **System Role Integrity:** Roles marcadas como `is_system` não podem ser renomeadas ou deletadas.
    2.  **Anti-Privilege Escalation:** Um usuário só pode atribuir permissões que ele mesmo possui.
    3.  **Role In Use:** Não se pode deletar uma role que tenha usuários ativos vinculados.

---

## 3. Estratégia Técnica

### Fase 1: Domain Definition (A Lei)
Criar a constante de permissões no coração do domínio para servir como Fonte da Verdade.

**Arquivo:** `src/modules/iam/domain/permission/SystemPermissions.ts`
```typescript
export const SystemPermissions = {
  USERS: {
    CREATE: "users:create",
    READ: "users:read",
    UPDATE: "users:update",
    STATUS: "users:status", // Last Admin Protection
  },
  ROLES: {
    CREATE: "roles:create", // Create Custom Role
    READ: "roles:read",
    UPDATE: "roles:update", // Assign Permissions to Role
    DELETE: "roles:delete",
    ASSIGN: "roles:assign", // Assign Role to User
  },
  PERMISSIONS: {
    READ: "permissions:read", // Catalog View
  }
} as const;
```

### Fase 2: Application Layer (ACL & Mappers)
O Mapper deve deixar de ser o "dono" da lista e passar a ser o "proxy" (ACL) que protege o domínio e traduz para a infra.

**Arquivo:** `src/modules/iam/application/mappers/permission/Permission.mapper.ts`
*   Importa `SystemPermissions` do domínio.
*   Expõe para a camada de Infra (Rotas) via getter ou propriedade estática, mantendo o fluxo de dependência correto (Infra -> App -> Domain).

### Fase 3: Infrastructure Layer (Enforcement)
As rotas consomem o Mapper para aplicar os middlewares de segurança.

**Arquivo:** `src/modules/iam/infra/http/bun-server/routes.ts`
*   Usa `PermissionMapper.SystemPermissions.USERS.CREATE` no middleware `requirePermission()`.

---

## 4. Fluxo de Validação (ACL)

1.  **Request:** Chega um POST em `/users`.
2.  **Middleware Auth:** Valida JWT e hidrata `ctx.user`.
3.  **Middleware Permission:** Verifica se `ctx.user.permissions` contém o slug exigido pela rota (definido no código via Mapper).
4.  **UseCase:** Executa a lógica de negócio.

---

## 5. Próximos Passos (Feature Roadmap)

1.  **Refatoração:** Mover `IAM_PERMISSIONS` do Mapper para `SystemPermissions` no Domínio.
2.  **Consumo:** Atualizar `seed.migration.ts` e `routes.ts` para refletir essa mudança.
3.  **Feature:** Implementar `CreateRoleUseCase` que aceita uma lista de slugs e valida se são `SystemPermissions` válidas.
