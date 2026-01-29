import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { IUserRepository } from "../../domain/user/user.repository";
import { RecoveryRepository } from "../../domain/authentication/repository/Recovery.repository";
import { TokenRepository } from "../../domain/authentication/repository/Token.repository";
import { PasswordHasher } from "../../../shared/domain/services/PasswordHasher.protocol";
import { EventBus } from "../../../shared/domain/events/EventBus.protocol";
import { ResetPasswordDTO } from "../mappers/auth/inputs/ResetPassword.input";
import { ResetPasswordResponseDTO } from "../mappers/auth/outputs/AuthResponses.output";
import { AuthMapper } from "../mappers/auth/Auth.mapper";
import { Email } from "../../domain/user/value_objects/Email.vo";

/**
 * ResetPasswordUseCase - Redefine a senha após validação do OTP.
 */
export class ResetPasswordUseCase implements UseCaseProvider<ResetPasswordDTO, ResetPasswordResponseDTO> {
  
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly recoveryRepository: RecoveryRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly eventBus: EventBus
  ) {}

  async execute(input: ResetPasswordDTO): Promise<ResetPasswordResponseDTO> {
    const data = AuthMapper.validateResetPassword(input);
    const emailVO = Email.create(data.email);

    // 1. Busca usuário
    const user = await this.userRepository.findByEmail(emailVO);
    if (!user || !user.isActive) {
      throw new Error("Invalid request or inactive account.");
    }

    // 2. Valida o código OTP
    const isValidCode = await this.recoveryRepository.findValidRecoveryCode(user.id, data.code);
    if (!isValidCode) {
      throw new Error("Invalid or expired recovery code.");
    }

    // 3. Atualiza a senha no Domínio (Hasheando antes)
    // O domínio agora cuida de registrar o evento UserPasswordChanged
    const newPasswordHash = await this.passwordHasher.hash(data.newPassword);
    user.changePassword(newPasswordHash);

    // 4. Marca código como usado
    await this.recoveryRepository.markRecoveryCodeAsUsed(isValidCode.id);

    // 5. Persiste usuário
    await this.userRepository.save(user);

    // 6. SEGURANÇA: Revoga todas as sessões
    await this.tokenRepository.revokeAllUserRefreshTokens(user.id);

    // 7. Publica eventos do agregado
    for (const event of user.domainEvents) {
      await this.eventBus.publish(event);
    }
    user.clearEvents();

    return { message: "Password reset successfully." };
  }
}