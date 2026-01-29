import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { IUserRepository } from "../../domain/user/user.repository";
import { IRoleRepository } from "../../domain/role/role.repository";
import { TokenRepository } from "../../domain/authentication/repository/Token.repository";
import { EventBus } from "../../../shared/domain/events/EventBus.protocol";
import { ChangeRoleDTO } from "../mappers/user/inputs/ChangeRole.input";
import { UserResponseDTO } from "../mappers/user/outputs/UserResponse.output";
import { UserMapper } from "../mappers/user/User.mapper";
import { createUserId, createRoleId } from "../../domain/types/identifiers";
import { UserManagerService } from "../../domain/services/user-manager.service";

/**
 * ChangeUserRoleUseCase - Altera o cargo de um usuário.
 * Delega validações de negócio para o UserManagerService (Domínio).
 */
export class ChangeUserRoleUseCase implements UseCaseProvider<ChangeRoleDTO, UserResponseDTO> {
  
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly userManagerService: UserManagerService,
    private readonly eventBus: EventBus
  ) {}

  async execute(input: ChangeRoleDTO): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(createUserId(input.userId));
    if (!user) throw new Error("User not found.");

    const newRoleId = createRoleId(input.newRoleId);
    const targetRole = await this.roleRepository.findById(newRoleId);
    if (!targetRole) throw new Error("Target Role not found.");

    // 1. Regras de Negócio no Domínio (Last Admin Standing)
    await this.userManagerService.validateStatusOrRoleChange(user, newRoleId);

    // 2. Executa a mudança
    user.changeRole(newRoleId);
    await this.userRepository.save(user);

    // 3. Segurança: Revoga sessões
    await this.tokenRepository.revokeAllUserRefreshTokens(user.id);

    // 4. Publica eventos
    for (const event of user.domainEvents) {
      await this.eventBus.publish(event);
    }
    user.clearEvents();

    return UserMapper.toResponse(user);
  }
}
