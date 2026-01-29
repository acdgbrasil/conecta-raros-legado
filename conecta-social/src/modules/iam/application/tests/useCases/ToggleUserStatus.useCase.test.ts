import { describe, test, expect, mock, beforeEach } from "bun:test";
import { ToggleUserStatusUseCase } from "../../useCases/ToggleUserStatus.useCase";
import { IUserRepository } from "../../../domain/user/user.repository";
import { IRoleRepository } from "../../../domain/role/role.repository";
import { TokenRepository } from "../../../domain/authentication/repository/Token.repository";
import { EventBus } from "../../../../shared/domain/events/EventBus.protocol";
import { UserMapper } from "../../mappers/user/User.mapper";
import { RoleMapper } from "../../mappers/role/Role.mapper";
import { UserManagerService } from "../../../domain/services/user-manager.service";

describe("ToggleUserStatusUseCase", () => {
  let userRepository: IUserRepository;
  let roleRepository: IRoleRepository;
  let tokenRepository: TokenRepository;
  let eventBus: EventBus;
  let userManagerService: UserManagerService;
  let useCase: ToggleUserStatusUseCase;

  const v7Id = "018e9c34-2e0b-70c8-8000-123456789000";
  const superAdminRoleId = "018e9c34-2e0b-70c8-8000-123456789999";

  const mockAdminUser = {
    id: v7Id, 
    person_id: v7Id, 
    name: "Admin", 
    email: "admin@test.com",
    password_hash: "h", 
    role_id: superAdminRoleId, 
    is_active: true,
    force_change_password: false, 
    job_title: "Manager",
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
      findByName: mock(async () => RoleMapper.fromPersistence({
        id: superAdminRoleId, name: "SuperAdmin", description: "d", is_system: true, permission_ids: [], created_at: new Date()
      }))
    } as any;

    tokenRepository = { revokeAllUserRefreshTokens: mock(async () => {}) } as any;
    eventBus = { publish: mock(async () => {}) } as any;
    
    userManagerService = new UserManagerService(userRepository, roleRepository);

    useCase = new ToggleUserStatusUseCase(userRepository, tokenRepository, userManagerService, eventBus);
  });

  test("should deactivate user and revoke tokens", async () => {
    const result = await useCase.execute({ userId: v7Id, isActive: false });

    expect(result.isActive).toBe(false);
    expect(tokenRepository.revokeAllUserRefreshTokens).toHaveBeenCalledWith(v7Id);
  });

  test("should throw error when trying to deactivate the LAST SuperAdmin", async () => {
    (userRepository.countActiveSuperAdmins as any).mockImplementation(() => Promise.resolve(1));

    expect(useCase.execute({ userId: v7Id, isActive: false }))
      .rejects.toThrow("Cannot remove or deactivate the last active SuperAdmin");
    
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
