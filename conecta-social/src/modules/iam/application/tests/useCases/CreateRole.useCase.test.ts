import { describe, test, expect, mock, beforeEach } from "bun:test";
import { CreateRoleUseCase } from "../../useCases/CreateRole.useCase";
import { IRoleRepository } from "../../../domain/role/role.repository";
import { IUserRepository } from "../../../domain/user/user.repository";
import { EventBus } from "../../../../shared/domain/events/EventBus.protocol";
import { RoleMapper } from "../../mappers/role/Role.mapper";
import { UserMapper } from "../../mappers/user/User.mapper";
import { RoleManagerService } from "../../../domain/services/role-manager.service";

describe("CreateRoleUseCase", () => {
  let roleRepository: IRoleRepository;
  let userRepository: IUserRepository;
  let roleManagerService: RoleManagerService;
  let eventBus: EventBus;
  let useCase: CreateRoleUseCase;

  const adminId = "018e9c34-2e0b-70c8-8000-123456789000";
  const adminRoleId = "018e9c34-2e0b-70c8-8000-123456789999";
  const perm1 = "018e9c34-2e0b-70c8-8000-123456789001";
  const permHacked = "018e9c34-2e0b-70c8-8000-123456789002";

  beforeEach(() => {
    roleRepository = {
      existsByName: mock(async () => false),
      save: mock(async () => {}),
      findById: mock(async () => RoleMapper.fromPersistence({
        id: adminRoleId, name: "Admin", description: "d", is_system: true, 
        permission_ids: [perm1], created_at: new Date()
      }))
    } as any;

    userRepository = {
      findById: mock(async () => UserMapper.fromPersistence({
        id: adminId, person_id: adminId, name: "Actor", email: "a@a.com",
        password_hash: "h", role_id: adminRoleId, is_active: true,
        force_change_password: false, job_title: "A", department: "D", 
        last_login_at: new Date(), created_at: new Date(), updated_at: new Date()
      }))
    } as any;

    roleManagerService = new RoleManagerService(roleRepository, userRepository);
    eventBus = { publish: mock(async () => {}) } as any;

    useCase = new CreateRoleUseCase(roleRepository, roleManagerService, eventBus);
  });

  test("should create role successfully when actor has permissions", async () => {
    const input = { 
      actorId: adminId, name: "New Editor", 
      description: "Desc", permissionIds: [perm1] 
    };
    const result = await useCase.execute(input);

    expect(result.name).toBe("New Editor");
    expect(roleRepository.save).toHaveBeenCalled();
  });

  test("should throw error if actor tries to assign permission they don't have", async () => {
    const input = { 
      actorId: adminId, name: "Hacker Role", 
      description: "Desc", permissionIds: [permHacked] 
    };
    
    expect(useCase.execute(input)).rejects.toThrow("Privilege Escalation Denied");
    expect(roleRepository.save).not.toHaveBeenCalled();
  });
});
