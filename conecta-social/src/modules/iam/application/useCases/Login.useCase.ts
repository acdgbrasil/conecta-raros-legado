import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { IUserRepository } from "../../domain/user/user.repository";
import { TokenRepository } from "../../domain/authentication/repository/Token.repository";
import { PasswordHasher } from "../../../shared/domain/services/PasswordHasher.protocol";
import { JwtProvider } from "../../../shared/domain/services/JwtProvider.protocol";
import { EventBus } from "../../../shared/domain/events/EventBus.protocol";
import { LoginDTO } from "../mappers/auth/inputs/Login.input";
import { LoginResponseDTO } from "../mappers/auth/outputs/LoginResponse.output";
import { AuthMapper } from "../mappers/auth/Auth.mapper";
import { UserMapper } from "../mappers/user/User.mapper";
import { Email } from "../../domain/user/value_objects/Email.vo";
import { TimeInSeconds } from "../../../shared/constants/TimeInSeconds.constants";

/**
 * LoginUseCase - Realiza a autenticação e gera tokens de acesso.
 */
export class LoginUseCase implements UseCaseProvider<LoginDTO, LoginResponseDTO> {
  
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtProvider: JwtProvider,
    private readonly eventBus: EventBus
  ) {}

  async execute(input: LoginDTO): Promise<LoginResponseDTO> {
    // 1. Validação de Formato (Fail-Fast)
    const credentials = AuthMapper.validateLogin(input);

    // 2. Busca Usuário
    const user = await this.userRepository.findByEmail(Email.create(credentials.email));
    if (!user || !user.isActive) {
      throw new Error("Invalid credentials or inactive account.");
    }

    // 3. Validação de Senha
    const isPasswordValid = await this.passwordHasher.compare(credentials.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials.");
    }

    // 4. Registro de Login no Domínio (Event Design)
    user.registerLogin();

    // 5. Geração de Tokens
    const accessToken = await this.jwtProvider.sign({
      sub: user.id,
      roleId: user.roleId,
      type: 'access'
    }, TimeInSeconds.FIVE_MINUTES);

    const refreshToken = await this.jwtProvider.sign({
      sub: user.id,
      type: 'refresh'
    }, TimeInSeconds.THIRTY_DAYS);

    // 6. Persistência do Refresh Token (Hash)
    const hasher = new Bun.CryptoHasher("sha256");
    const rtHash = hasher.update(refreshToken).digest("hex");
    const expiresAt = new Date(Date.now() + (TimeInSeconds.THIRTY_DAYS * 1000));
    
    await this.tokenRepository.saveRefreshToken(user.id, rtHash, expiresAt);

    // 7. Salva estado do usuário (lastLoginAt)
    await this.userRepository.save(user);

    // 8. Publicação de Eventos (UserLoggedIn)
    for (const event of user.domainEvents) {
      await this.eventBus.publish(event);
    }
    user.clearEvents();

    // 9. Resposta
    return AuthMapper.toLoginResponse({
      accessToken,
      refreshToken,
      user: UserMapper.toResponse(user)
    });
  }
}