import { PasswordRecoveryRequestedEvent } from "../../domain/user/events/PasswordRecoveryRequested.event";
import { TimeInSeconds } from "../../../shared/constants/TimeInSeconds.constants";
import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { RecoveryRepository } from "../../domain/authentication/repository/Recovery.repository";
import { UserRepository } from "../../domain/user/repository/User.repository";
import { AuthInput, ForgotPasswordInput } from "../../mapper/auth/Auth.input";
import { ForgotPasswordOutput } from "../../mapper/auth/Auth.output";
import { EventBus } from "../../../shared/domain/events/EventBus.protocol";

/**
 * UseCase responsável por iniciar o fluxo de recuperação de senha.
 * Gera um código OTP e dispara evento para envio de e-mail.
 */
export class ForgotPasswordUseCase implements UseCaseProvider<ForgotPasswordInput,ForgotPasswordOutput> {

  constructor(
    private readonly userRepository: UserRepository,
    private readonly recoveryRepository: RecoveryRepository,
    private readonly eventBus: EventBus // Injeção do EventBus
  ) {}

  /**
   * Executa a solicitação de recuperação.
   * Implementa "Silent Fail" para evitar Enumeration Attacks.
   * 
   * @param input E-mail do usuário.
   * @returns Mensagem genérica de sucesso.
   */
  async execute(input: ForgotPasswordInput): Promise<ForgotPasswordOutput> {
    const parsedInput = AuthInput.parserForgotPassword(input);
    const user = await this.userRepository.findByEmail(parsedInput.email);

    // SECURITY: Silent Fail
    if (!user || !user.isActive) {
      return { message: "Se o e-mail estiver cadastrado, você receberá um código de recuperação." };
    }

    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + (TimeInSeconds.FIFTEEN_MINUTES * 1000));
    
    await this.recoveryRepository.saveRecoveryCode(user.email, recoveryCode, expiresAt);

    // Publica o evento ao invés de chamar o outro UseCase diretamente
    await this.eventBus.publish(new PasswordRecoveryRequestedEvent(user.email, recoveryCode));

    return { message: "Se o e-mail estiver cadastrado, você receberá um código de recuperação." };
  }
}