import { describe, expect, test } from "bun:test";
import { SystemPermissions } from "../domain/permission/SystemPermissions";
import { PermissionMapper } from "../application/mappers/permission/Permission.mapper";

describe("IAM Architecture & ACL Contracts", () => {
  
  test("Domain: SystemPermissions should be immutable (Source of Truth)", () => {
    // Garante que a estrutura definida no Domínio está correta
    expect(SystemPermissions.USERS.CREATE).toBe("users:create");
    expect(SystemPermissions.USERS.READ).toBe("users:read");
    expect(SystemPermissions.USERS.UPDATE).toBe("users:update");
    expect(SystemPermissions.USERS.STATUS).toBe("users:status");

    expect(SystemPermissions.ROLES.CREATE).toBe("roles:create");
    expect(SystemPermissions.ROLES.ASSIGN).toBe("roles:assign");
    
    expect(SystemPermissions.PERMISSIONS.READ).toBe("permissions:read");
  });

  test("Application: PermissionMapper should act as ACL for SystemPermissions", () => {
    // O Mapper deve refletir exatamente o que o domínio dita
    // Se o domínio mudar, o Mapper deve mudar junto (ou adaptar)
    expect(PermissionMapper.IAM_PERMISSIONS.USERS.CREATE).toBe(SystemPermissions.USERS.CREATE);
    expect(PermissionMapper.IAM_PERMISSIONS.ROLES.DELETE).toBe(SystemPermissions.ROLES.DELETE);
  });

  test("Application: ACL should maintain structural contract for Infrastructure", () => {
    // A camada de Infra (Rotas) depende dessa estrutura exata
    expect(PermissionMapper.IAM_PERMISSIONS).toHaveProperty("USERS");
    expect(PermissionMapper.IAM_PERMISSIONS.USERS).toHaveProperty("CREATE");
    
    expect(PermissionMapper.IAM_PERMISSIONS).toHaveProperty("ROLES");
    expect(PermissionMapper.IAM_PERMISSIONS.ROLES).toHaveProperty("ASSIGN");
  });
});
