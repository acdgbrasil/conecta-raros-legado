import { describe, expect, test, mock } from "bun:test";
import { RoleManagerService } from "../role-manager.service";
import { IRoleRepository } from "../../role/role.repository";
import { IUserRepository } from "../../user/user.repository";
import { RoleAggregate } from "../../role/role.entity";
import { RoleName } from "../../role/value_objects/RoleName.vo";
import { createRoleId, createUserId, createPermissionId } from "../../types/identifiers";

// Mock Repositories
const mockRoleRepo = {
  findById: mock(),
  findByName: mock(),
  existsByName: mock(),
  save: mock(),
  delete: mock(),
  findAll: mock()
} as unknown as IRoleRepository;

const mockUserRepo = {
  findById: mock(),
  existsActiveByRole: mock(),
  countActiveSuperAdmins: mock()
} as unknown as IUserRepository;

describe("RoleManagerService (Domain Rules)", () => {
  const service = new RoleManagerService(mockRoleRepo, mockUserRepo);

  // Setup básico
  const systemRoleId = createRoleId("018e9c32-1b0e-7447-8a62-7231d1b12345");
  const customRoleId = createRoleId("018e9c32-1b0e-7447-8a62-7231d1b12346");
  const actorId = createUserId("018e9c32-1b0e-7447-8a62-7231d1b12399");

  // Helper para criar role mockada
  const createMockRole = (id: any, isSystem: boolean, perms: string[] = []) => {
    // @ts-ignore - Acesso privado simulado ou mock parcial
    return {
      id,
      isSystem,
      permissionIds: new Set(perms.map(createPermissionId)),
      canBeDeleted: () => !isSystem,
      name: RoleName.create("MockRole")
    } as unknown as RoleAggregate;
  };

  test("Rule #1: Should prevent deletion of System Roles", async () => {
    const sysRole = createMockRole(systemRoleId, true);
    (mockRoleRepo.findById as any).mockResolvedValue(sysRole);

    expect(service.validateDeletion(systemRoleId)).rejects.toThrow("System roles cannot be deleted");
  });

  test("Rule #3: Should prevent deletion of Roles in Use", async () => {
    const role = createMockRole(customRoleId, false);
    (mockRoleRepo.findById as any).mockResolvedValue(role);
    (mockUserRepo.existsActiveByRole as any).mockResolvedValue(true); // Tem usuários!

    expect(service.validateDeletion(customRoleId)).rejects.toThrow("active users assigned");
  });

  test("Rule #2: Should prevent duplicate Role names", async () => {
    (mockRoleRepo.existsByName as any).mockResolvedValue(true);
    expect(service.validateNameUniqueness(RoleName.create("ExistingRole"))).rejects.toThrow("already exists");
  });

  test("Rule #4: Anti-Privilege Escalation (Should block if actor lacks permission)", async () => {
    const actorRole = createMockRole(createRoleId("role-1"), false, ["users:read"]);
    const actor = { id: actorId, roleId: actorRole.id } as any;

    (mockUserRepo.findById as any).mockResolvedValue(actor);
    (mockRoleRepo.findById as any).mockResolvedValue(actorRole);

    // O ator tem 'users:read', mas tenta atribuir 'users:delete'
    const requestedPerms = ["users:read", "users:delete"];

    expect(service.validatePrivileges(actorId, requestedPerms)).rejects.toThrow("Privilege Escalation Denied");
  });

  test("Rule #4: Anti-Privilege Escalation (Should allow if actor has all permissions)", async () => {
    const actorRole = createMockRole(createRoleId("role-1"), false, ["users:read", "users:create"]);
    const actor = { id: actorId, roleId: actorRole.id } as any;

    (mockUserRepo.findById as any).mockResolvedValue(actor);
    (mockRoleRepo.findById as any).mockResolvedValue(actorRole);

    // O ator tem tudo o que pede
    const requestedPerms = ["users:create"];

    await expect(service.validatePrivileges(actorId, requestedPerms)).resolves.toBeUndefined();
  });
});
