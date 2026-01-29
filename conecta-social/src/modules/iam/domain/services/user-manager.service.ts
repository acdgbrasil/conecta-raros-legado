import { IUserRepository } from "../user/user.repository";
import { IRoleRepository } from "../role/role.repository";
import { RoleName } from "../role/value_objects/RoleName.vo";
import { UserAggregate } from "../user/user.entity";
import { RoleId } from "../types/identifiers";

/**
 * UserManagerService - Serviço de Domínio para regras complexas de usuários.
 */
export class UserManagerService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository
  ) {}

  /**
   * Valida se um usuário pode mudar de cargo ou ser desativado.
   * Regra #7: Last Admin Standing.
   */
  public async validateStatusOrRoleChange(user: UserAggregate, newRoleId?: RoleId, newActiveStatus?: boolean): Promise<void> {
    const superAdminRole = await this.roleRepository.findByName(RoleName.create("SuperAdmin"));
    if (!superAdminRole) return;

    // Se o usuário é o único SuperAdmin ativo
    const isSuperAdmin = user.roleId === superAdminRole.id;
    const isChangingToNonAdmin = newRoleId && newRoleId !== superAdminRole.id;
    const isDeactivating = newActiveStatus === false;

    if (isSuperAdmin && (isChangingToNonAdmin || isDeactivating)) {
      const activeAdminsCount = await this.userRepository.countActiveSuperAdmins();
      if (activeAdminsCount <= 1) {
        throw new Error("Domain Rule Violation: Cannot remove or deactivate the last active SuperAdmin.");
      }
    }
  }
}
