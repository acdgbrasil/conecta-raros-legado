import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { IUserRepository } from "../../domain/user/user.repository";
import { RecoveryRepository } from "../../domain/authentication/repository/Recovery.repository";
import { EventBus } from "../../../shared/domain/events/EventBus.protocol";
import { ForgotPasswordDTO } from "../mappers/auth/inputs/ForgotPassword.input";
import { ForgotPasswordResponseDTO } from "../mappers/auth/outputs/AuthResponses.output";
import { AuthMapper } from "../mappers/auth/Auth.mapper";
import { Email } from "../../domain/user/value_objects/Email.vo";
import { TimeInSeconds } from "../../../shared/constants/TimeInSeconds.constants";
import { PasswordRecoveryRequestedEvent } from "modules/iam/domain/user/events/PasswordRecoveryRequested.event";

/**
 * ForgotPasswordUseCase - Inicia o fluxo de recuperação de senha.
 */
export class ForgotPasswordUseCase implements UseCaseProvider<ForgotPasswordDTO, ForgotPasswordResponseDTO> {
  
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly recoveryRepository: RecoveryRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(input: ForgotPasswordDTO): Promise<ForgotPasswordResponseDTO> {
    const data = AuthMapper.validateForgotPassword(input);
    const emailVO = Email.create(data.email);
    
    const user = await this.userRepository.findByEmail(emailVO);

    const message = "If the email is registered, you will receive a recovery code.";

    // SECURITY: Silent Fail (Enumeration protection)
    if (!user || !user.isActive) {
      return { message };
    }

    // 1. Gera código OTP
    const recoveryCode = this.recoveryRepository.createRecoveryCode();
    const expiresAt = new Date(Date.now() + (TimeInSeconds.FIFTEEN_MINUTES * 1000));
    
    // 2. Salva o código
    await this.recoveryRepository.saveRecoveryCode(user.id, recoveryCode, expiresAt);

    // 3. Dispara evento de recuperação (para envio de e-mail)
    await this.eventBus.publish(new PasswordRecoveryRequestedEvent(user.email.value, recoveryCode));

    return { message };
  }
}
