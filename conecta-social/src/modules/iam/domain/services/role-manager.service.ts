import { IRoleRepository } from "../role/role.repository";
import { IUserRepository } from "../user/user.repository";
import { RoleAggregate } from "../role/role.entity";
import { UserId, createPermissionId, PermissionId, RoleId } from "../types/identifiers";
import { RoleName } from "../role/value_objects/RoleName.vo";

/**
 * RoleManagerService - Serviço de Domínio para orquestração de regras de cargos.
 */
export class RoleManagerService {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly userRepository: IUserRepository
  ) {}

  /**
   * Regra #4: Anti-Privilege Escalation.
   * Garante que o autor possui as permissões que está tentando atribuir.
   */
  public async validatePrivileges(actorId: UserId, requestedPermIds: string[]): Promise<void> {
    const actor = await this.userRepository.findById(actorId);
    if (!actor) throw new Error("Actor not found.");

    const actorRole = await this.roleRepository.findById(actor.roleId);
    if (!actorRole) throw new Error("Actor role not found.");

    const actorPerms = actorRole.permissionIds;
    for (const permId of requestedPermIds) {
      if (!actorPerms.has(createPermissionId(permId))) {
        throw new Error(`Privilege Escalation Denied: You don't have permission '${permId}'.`);
      }
    }
  }

  /**
   * Regra #3: Role In Use Protection.
   * Regra #1: System Role Integrity.
   */
  public async validateDeletion(roleId: RoleId): Promise<void> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) throw new Error("Role not found.");

    if (!role.canBeDeleted()) {
      throw new Error("Domain Rule Violation: System roles cannot be deleted.");
    }

    const hasActiveUsers = await this.userRepository.existsActiveByRole(roleId);
    if (hasActiveUsers) {
      throw new Error("Domain Rule Violation: Cannot delete role while there are active users assigned to it.");
    }
  }

  /**
   * Regra #2: Role Name Uniqueness.
   */
  public async validateNameUniqueness(name: RoleName): Promise<void> {
    const exists = await this.roleRepository.existsByName(name);
    if (exists) {
      throw new Error(`Domain Rule Violation: Role with name '${name.value}' already exists.`);
    }
  }
}