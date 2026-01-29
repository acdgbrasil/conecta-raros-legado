import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { IRoleRepository } from "../../domain/role/role.repository";
import { IUserRepository } from "../../domain/user/user.repository";
import { TokenRepository } from "../../domain/authentication/repository/Token.repository";
import { EventBus } from "../../../shared/domain/events/EventBus.protocol";
import { UpdateRoleDTO, RoleResponseDTO } from "../mappers/role/inputs/UpdateRole.input";
import { RoleMapper } from "../mappers/role/Role.mapper";
import { RoleName } from "../../domain/role/value_objects/RoleName.vo";
import { createRoleId, createUserId, createPermissionId } from "../../domain/types/identifiers";
import { RoleManagerService } from "../../domain/services/role-manager.service";

export interface UpdateRoleRequest extends UpdateRoleDTO {
  actorId: string;
}

/**
 * UpdateRoleUseCase - Atualiza um cargo e gerencia a segurança dos usuários vinculados.
 */
export class UpdateRoleUseCase implements UseCaseProvider<UpdateRoleRequest, RoleResponseDTO> {
  
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly userRepository: IUserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly roleManagerService: RoleManagerService,
    private readonly eventBus: EventBus
  ) {}

  async execute(input: UpdateRoleRequest): Promise<RoleResponseDTO> {
    const roleId = createRoleId(input.id);
    const role = await this.roleRepository.findById(roleId);
    if (!role) throw new Error("Role not found.");

    if (input.name) role.rename(RoleName.create(input.name));
    if (input.description) role.description = input.description;

    const permissionsChanged = !!input.permissionIds;

    // 1. Atualização de Permissões com Trava Anti-Privilege Escalation via Domain Service
    if (input.permissionIds) {
      await this.roleManagerService.validatePrivileges(createUserId(input.actorId), input.permissionIds);
      role.updatePermissions(new Set(input.permissionIds.map(createPermissionId)));
    }

    // 2. Persistência
    await this.roleRepository.save(role);

    // 3. SEGURANÇA (Regra #10): Revogação em Cascata
    if (permissionsChanged) {
      const affectedUserIds = await this.userRepository.findActiveIdsByRole(role.id);
      for (const userId of affectedUserIds) {
        await this.tokenRepository.revokeAllUserRefreshTokens(userId);
      }
    }

    // 4. Publica eventos
    for (const event of role.domainEvents) {
      await this.eventBus.publish(event);
    }
    role.clearEvents();

    return RoleMapper.toResponse(role);
  }
}
