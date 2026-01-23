import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { RecoveryRepository } from "../../domain/authentication/repository/Recovery.repository";
import { TokenRepository } from "../../domain/authentication/repository/Token.repository";
import { UserRepository } from "../../domain/user/repository/User.repository";
import { AuthInput, ResetPasswordInput } from "../../mapper/auth/Auth.input";
import { ResetPasswordOutput } from "../../mapper/auth/Auth.output";

/**
 * UseCase para redefinir a senha do usuário utilizando um código OTP validado.
 */
export class ResetPasswordUseCase implements UseCaseProvider<ResetPasswordInput, ResetPasswordOutput> {

  constructor(
    private readonly recoveryRepository: RecoveryRepository,
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository
  ){}

  /**
   * Redefine a senha.
   * 1. Valida o código OTP.
   * 2. Atualiza a senha.
   * 3. Marca código como usado.
   * 4. Revoga todas as sessões ativas do usuário.
   */
  async execute(input: ResetPasswordInput): Promise<ResetPasswordOutput> {
    const parsedInput = AuthInput.parserResetPassword(input);
    
    // 1. Busca usuário primeiro para obter o ID
    const user = await this.userRepository.findByEmail(parsedInput.email);
    if(!user || !user.isActive) {
      throw new Error("Usuário não encontrado ou inativo.");
    }

    // 2. Valida o código usando o ID do usuário (Integridade Referencial)
    const recoveryCode = await this.recoveryRepository.findValidRecoveryCode(user.id!, parsedInput.code);
    if(!recoveryCode) {
      throw new Error("Código de recuperação inválido ou expirado.");
    }

    const hashedPassword = await Bun.password.hash(parsedInput.newPassword);
    
    user.definePassword(hashedPassword);
    
    await this.userRepository.save(user);
    await this.recoveryRepository.markRecoveryCodeAsUsed(recoveryCode.id);
    
    // Logout em todos os dispositivos por segurança
    await this.tokenRepository.revokeAllUserRefreshTokens(user.id!);
    
    return { message: "Senha redefinida com sucesso." };
  }
  
}