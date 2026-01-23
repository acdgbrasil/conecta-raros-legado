import { TimeInSeconds } from "../../../shared/constants/TimeInSeconds.constants";
import { JwtProvider } from "../../../shared/providers/jwt/Jwt.provider";
import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { TokenRepository } from "../../domain/authentication/repository/Token.repository";
import { UserRepository } from "../../domain/user/repository/User.repository"; 
import { AuthInput, LoginInput } from "../../mapper/auth/Auth.input";
import { LoginOutput } from "../../mapper/auth/Auth.output";
import { UserMapper } from "../../mapper/user/User.mapper";

/**
 * UseCase responsável pela autenticação (Login) do usuário.
 */
export class LoginUseCase implements UseCaseProvider<LoginInput,LoginOutput> {

  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly jwtProvider: JwtProvider
  ){}

  /**
   * Realiza o login.
   * 1. Valida credenciais.
   * 2. Verifica hash da senha.
   * 3. Gera Access Token (curta duração).
   * 4. Gera Refresh Token (longa duração) e salva hash no banco.
   * 
   * @param input Email e Senha.
   * @returns Tokens e dados do usuário.
   */
  async execute(input: { email: string; password: string; }): Promise<LoginOutput> {
    // Parser atualizado
    const loginParsed = AuthInput.parserLogin(input);
    
    const user = await this.userRepository.findByEmail(loginParsed.email);
    if(!user) throw new Error("Credenciais inválidas.");
    if(!user.passwordHash) throw new Error("Conta não ativada ou sem senha definida.");
    const isValid = await Bun.password.verify(loginParsed.password, user.passwordHash);
    if(!isValid) throw new Error("Credenciais inválidas.");
    if(!user.isActive) throw new Error("Usuário inativo. Contate o administrador.");

    const token = await this.jwtProvider.sign({
      sub: user.id!,
      type:'access',
      roleId: user.roleId,
      permissions: user.permissions || [],
    },TimeInSeconds.FIVE_MINUTES);

    const refreshToken = await this.jwtProvider.sign({
      sub: user.id!,
      type:'refresh',
    },TimeInSeconds.THIRTY_DAYS);

    const hasher = new Bun.CryptoHasher("sha256");
    const hash = hasher.update(refreshToken).digest("hex");
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.tokenRepository.saveRefreshToken(user.id!, hash, expiresAt);

    user.registerLogin();
    await this.userRepository.save(user);

    return {
      accessToken: token,
      refreshToken: refreshToken,
      user: UserMapper.toResponse(user),
    }
  }

}
