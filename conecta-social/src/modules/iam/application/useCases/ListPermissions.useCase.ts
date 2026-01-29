import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { IPermissionRepository } from "../../domain/permission/permission.repository";
import { PermissionResponseDTO } from "../mappers/permission/outputs/PermissionResponse.output";
import { PermissionMapper } from "../mappers/permission/Permission.mapper";

/**
 * ListPermissionsUseCase - Retorna todas as permissões cadastradas.
 */
export class ListPermissionsUseCase implements UseCaseProvider<void, PermissionResponseDTO[]> {
  
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  async execute(): Promise<PermissionResponseDTO[]> {
    const permissions = await this.permissionRepository.findAll();
    return permissions.map(PermissionMapper.toResponse);
  }
}
