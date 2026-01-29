import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { IRoleRepository } from "../../domain/role/role.repository";
import { EventBus } from "../../../shared/domain/events/EventBus.protocol";
import { CreateRoleDTO, RoleResponseDTO } from "../mappers/role/inputs/CreateRole.input";
import { RoleMapper } from "../mappers/role/Role.mapper";
import { RoleName } from "../../domain/role/value_objects/RoleName.vo";
import { createUserId } from "../../domain/types/identifiers";
import { RoleCreatedEvent } from "../../domain/events/RoleCreated.event";
import { RoleManagerService } from "../../domain/services/role-manager.service";

export interface CreateRoleRequest extends CreateRoleDTO {
  actorId: string;
}

/**
 * CreateRoleUseCase - Cria um novo cargo.
 * Delega validações de negócio para o RoleManagerService (Domínio).
 */
export class CreateRoleUseCase implements UseCaseProvider<CreateRoleRequest, RoleResponseDTO> {
  
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly roleManagerService: RoleManagerService,
    private readonly eventBus: EventBus
  ) {}

  async execute(input: CreateRoleRequest): Promise<RoleResponseDTO> {
    // 1. Regras de Negócio no Domínio
    const roleName = RoleName.create(input.name);
    await this.roleManagerService.validateNameUniqueness(roleName);
    await this.roleManagerService.validatePrivileges(createUserId(input.actorId), input.permissionIds);

    // 2. Orquestração de Criação
    const role = RoleMapper.toDomain(input);
    await this.roleRepository.save(role);

    // 3. Event Design
    await this.eventBus.publish(new RoleCreatedEvent(role.id, role.name));

    return RoleMapper.toResponse(role);
  }
}