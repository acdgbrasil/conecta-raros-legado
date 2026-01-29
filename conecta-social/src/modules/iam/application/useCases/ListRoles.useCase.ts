import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { IRoleRepository } from "../../domain/role/role.repository";
import { RoleResponseDTO } from "../mappers/role/outputs/RoleResponse.output";
import { RoleMapper } from "../mappers/role/Role.mapper";

/**
 * ListRolesUseCase - Retorna todos os cargos disponíveis no sistema.
 */
export class ListRolesUseCase implements UseCaseProvider<void, RoleResponseDTO[]> {
  
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(): Promise<RoleResponseDTO[]> {
    const roles = await this.roleRepository.findAll();
    return roles.map(RoleMapper.toResponse);
  }
}
