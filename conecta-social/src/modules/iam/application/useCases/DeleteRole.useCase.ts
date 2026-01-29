import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { IRoleRepository } from "../../domain/role/role.repository";
import { RoleManagerService } from "../../domain/services/role-manager.service";
import { createRoleId } from "../../domain/types/identifiers";

/**
 * DeleteRoleUseCase - Remove um cargo.
 * Delega validações de negócio para o RoleManagerService (Domínio).
 */
export class DeleteRoleUseCase implements UseCaseProvider<{ id: string }, void> {
  
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly roleManagerService: RoleManagerService
  ) {}

  async execute(input: { id: string }): Promise<void> {
    const roleId = createRoleId(input.id);

    // 1. Regras de Negócio no Domínio (System Role e Role In Use)
    await this.roleManagerService.validateDeletion(roleId);

    // 2. Exclusão Física
    await this.roleRepository.delete(roleId);
  }
}
