import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { TokenRepository } from "../../domain/authentication/repository/Token.repository";
import { UserRepository } from "../../domain/user/repository/User.repository";
import { UpdateUserStatusInput, UserInput } from "../../mapper/user/User.input";
import { UserMapper } from "../../mapper/user/User.mapper";
import { UserResponse } from "../../mapper/user/User.output";

/**
 * UseCase para ativar ou desativar um usuário.
 */
export class UpdateUserStatusUseCase implements UseCaseProvider<UpdateUserStatusInput, UserResponse> {
  
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository
  ) {}

  /**
   * Altera o status.
   * Se o usuário for desativado, todas as sessões são revogadas.
   */
  async execute(input: UpdateUserStatusInput): Promise<UserResponse> {
    const parsed = UserInput.parserUpdateStatus(input);

    const user = await this.userRepository.findById(parsed.userId);
    if (!user) throw new Error("Usuário não encontrado.");

    // TODO: REVISAR REGRAS DE NEGÓCIO
    // Impede que um admin desative a si mesmo (evitar lockout acidental)
    // if (parsed.actorId === parsed.userId) throw new Error("Não é possível desativar sua própria conta.");

    // Se o status solicitado for diferente do atual, aplicamos a mudança
    if (user.isActive !== parsed.isActive) {
      user.toggleStatus();
      await this.userRepository.save(user);

      // Segurança: Se desativou, mata todas as sessões
      if (!user.isActive) {
        await this.tokenRepository.revokeAllUserRefreshTokens(user.id!);
      }
    }

    return UserMapper.toResponse(user);
  }
}