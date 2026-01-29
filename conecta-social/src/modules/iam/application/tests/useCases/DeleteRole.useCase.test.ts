import { describe, test, expect, mock, beforeEach } from "bun:test";
import { DeleteRoleUseCase } from "../../useCases/DeleteRole.useCase";
import { IRoleRepository } from "../../../domain/role/role.repository";
import { IUserRepository } from "../../../domain/user/user.repository";
import { RoleMapper } from "../../mappers/role/Role.mapper";
import { RoleManagerService } from "../../../domain/services/role-manager.service";

describe("DeleteRoleUseCase", () => {
  let roleRepository: IRoleRepository;
  let userRepository: IUserRepository;
  let roleManagerService: RoleManagerService;
  let useCase: DeleteRoleUseCase;

  const roleId = "018e9c34-2e0b-70c8-8000-123456789000";

  beforeEach(() => {
    roleRepository = {
      findById: mock(async () => RoleMapper.fromPersistence({
        id: roleId, name: "Custom", description: "d", is_system: false, permission_ids: [], created_at: new Date()
      })),
      delete: mock(async () => {}),
      existsByName: mock()
    } as any;

    userRepository = {
      existsActiveByRole: mock(async () => false)
    } as any;

    roleManagerService = new RoleManagerService(roleRepository, userRepository);
    useCase = new DeleteRoleUseCase(roleRepository, roleManagerService);
  });

  test("should delete role successfully when not in use", async () => {
    await useCase.execute({ id: roleId });
    expect(roleRepository.delete).toHaveBeenCalledWith(roleId as any);
  });

  test("should throw error if role has active users", async () => {
    (userRepository.existsActiveByRole as any).mockImplementation(() => Promise.resolve(true));

    expect(useCase.execute({ id: roleId })).rejects.toThrow("active users assigned");
    expect(roleRepository.delete).not.toHaveBeenCalled();
  });

  test("should throw error if trying to delete a system role", async () => {
    (roleRepository.findById as any).mockImplementation(() => Promise.resolve(
      RoleMapper.fromPersistence({ id: "018e9c34-2e0b-70c8-8000-123456789999", name: "Sys", description: "d", is_system: true, permission_ids: [], created_at: new Date() })
    ));

    expect(useCase.execute({ id: "018e9c34-2e0b-70c8-8000-123456789999" })).rejects.toThrow("System roles cannot be deleted");
  });
});
