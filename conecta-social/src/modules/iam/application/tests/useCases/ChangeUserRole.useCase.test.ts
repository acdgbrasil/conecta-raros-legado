import { describe, test, expect, mock, beforeEach } from "bun:test";
import { ChangeUserRoleUseCase } from "../../useCases/ChangeUserRole.useCase";
import { IUserRepository } from "../../../domain/user/user.repository";
import { IRoleRepository } from "../../../domain/role/role.repository";
import { TokenRepository } from "../../../domain/authentication/repository/Token.repository";
import { EventBus } from "../../../../shared/domain/events/EventBus.protocol";
import { UserMapper } from "../../mappers/user/User.mapper";
import { RoleMapper } from "../../mappers/role/Role.mapper";
import { UserManagerService } from "../../../domain/services/user-manager.service";

describe("ChangeUserRoleUseCase", () => {
  let userRepository: IUserRepository;
  let roleRepository: IRoleRepository;
  let tokenRepository: TokenRepository;
  let userManagerService: UserManagerService;
  let eventBus: EventBus;
  let useCase: ChangeUserRoleUseCase;

  const v7Id = "018e9c34-2e0b-70c8-8000-123456789000";
  const adminRoleId = "018e9c34-2e0b-70c8-8000-123456789999";
  const editorRoleId = "018e9c34-2e0b-70c8-8000-123456789888";

  const mockAdminUser = {
    id: v7Id, 
    person_id: v7Id, 
    name: "Admin", 
    email: "admin@test.com",
    password_hash: "h", 
    role_id: adminRoleId, 
    is_active: true,
    force_change_password: false, 
    job_title: "Staff",
    department: "IT",
    last_login_at: new Date(),
    created_at: new Date(), 
    updated_at: new Date()
  };

  beforeEach(() => {
    userRepository = {
      findById: mock(async () => UserMapper.fromPersistence(mockAdminUser)),
      save: mock(async () => {}),
      countActiveSuperAdmins: mock(async () => 2)
    } as any;

    roleRepository = {
      findById: mock(async (id) => RoleMapper.fromPersistence({
        id: id as string, name: "Role", description: "d", is_system: false, permission_ids: [], created_at: new Date()
      })),
      findByName: mock(async () => RoleMapper.fromPersistence({
        id: adminRoleId, name: "SuperAdmin", description: "d", is_system: true, permission_ids: [], created_at: new Date()
      }))
    } as any;

    tokenRepository = { revokeAllUserRefreshTokens: mock(async () => {}) } as any;
    eventBus = { publish: mock(async () => {}) } as any;
    userManagerService = new UserManagerService(userRepository, roleRepository);

    useCase = new ChangeUserRoleUseCase(userRepository, roleRepository, tokenRepository, userManagerService, eventBus);
  });

  test("should change role successfully and revoke sessions", async () => {
    const result = await useCase.execute({ userId: v7Id, newRoleId: editorRoleId });

    expect(result.roleId).toBe(editorRoleId);
    expect(tokenRepository.revokeAllUserRefreshTokens).toHaveBeenCalledWith(v7Id);
  });

  test("should throw error when reclassifying the LAST SuperAdmin", async () => {
    (userRepository.countActiveSuperAdmins as any).mockImplementation(() => Promise.resolve(1));

    expect(useCase.execute({ userId: v7Id, newRoleId: editorRoleId }))
      .rejects.toThrow("Cannot remove or deactivate the last active SuperAdmin");
  });
});
