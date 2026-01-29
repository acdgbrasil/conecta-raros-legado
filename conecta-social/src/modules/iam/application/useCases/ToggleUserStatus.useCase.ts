import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { IUserRepository } from "../../domain/user/user.repository";
import { TokenRepository } from "../../domain/authentication/repository/Token.repository";
import { EventBus } from "../../../shared/domain/events/EventBus.protocol";
import { UpdateUserStatusDTO } from "../mappers/user/inputs/UpdateUserStatus.input";
import { UserResponseDTO } from "../mappers/user/outputs/UserResponse.output";
import { UserMapper } from "../mappers/user/User.mapper";
import { createUserId } from "../../domain/types/identifiers";
import { UserManagerService } from "../../domain/services/user-manager.service";

/**
 * ToggleUserStatusUseCase - Ativa ou desativa um usuário.
 * Delega validação de Last Admin Standing para o UserManagerService (Domínio).
 */
export class ToggleUserStatusUseCase implements UseCaseProvider<UpdateUserStatusDTO, UserResponseDTO> {
  
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly userManagerService: UserManagerService,
    private readonly eventBus: EventBus
  ) {}

  async execute(input: UpdateUserStatusDTO): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(createUserId(input.userId));
    if (!user) throw new Error("User not found.");

    // 1. Regras de Negócio no Domínio (Last Admin Standing)
    if (user.isActive && !input.isActive) {
      await this.userManagerService.validateStatusOrRoleChange(user, undefined, false);
    }

    // 2. Aplica a mudança se o status for diferente
    if (user.isActive !== input.isActive) {
      user.toggleStatus(input.isActive);
      await this.userRepository.save(user);

      // Segurança: Se desativou, mata as sessões
      if (!user.isActive) {
        await this.tokenRepository.revokeAllUserRefreshTokens(user.id);
      }

      // 3. Publicação de Eventos
      for (const event of user.domainEvents) {
        await this.eventBus.publish(event);
      }
      user.clearEvents();
    }

    return UserMapper.toResponse(user);
  }
}
