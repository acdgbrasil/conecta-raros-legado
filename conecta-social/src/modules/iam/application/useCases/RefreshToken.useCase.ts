import { TimeInSeconds } from "../../../shared/constants/TimeInSeconds.constants";
import { JwtProvider } from "../../../shared/providers/jwt/Jwt.provider";
import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { TokenRepository } from "../../domain/authentication/repository/Token.repository";
import { UserRepository } from "../../domain/user/repository/User.repository"; 
import { RefreshTokenOutput } from "../../mapper/auth/Auth.output";
import { AuthInput, RefreshTokenInput } from "../../mapper/auth/Auth.input";

/**
 * UseCase para renovação do Access Token usando um Refresh Token.
 * Implementa rotação de tokens e detecção de reuso.
 */
export class RefreshTokenUseCase implements UseCaseProvider<RefreshTokenInput, RefreshTokenOutput> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly jwtProvider: JwtProvider
  ) {}

  /**
   * Renova o token.
   * Implementa Reuse Detection: Se um token já usado ou revogado for enviado,
   * TODOS os tokens do usuário são revogados por segurança.
   */
  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    const parsedInput = AuthInput.parserRefresh(input);
    
    const payload = await this.jwtProvider.verify(parsedInput.refreshToken);
    if (payload.type !== "refresh")  throw new Error("Invalid token type");
    const hasher = new Bun.CryptoHasher("sha256");
    const tokenHash = hasher.update(parsedInput.refreshToken).digest("hex");
    
    const storedToken = await this.tokenRepository.findRefreshToken(tokenHash);
    
    if (!storedToken || storedToken.isRevoked) {
      if (storedToken) {
        await this.tokenRepository.revokeAllUserRefreshTokens(storedToken.userId);
      }
      throw new Error("Token inválido ou reutilizado. Faça login novamente.");
    }
    
    await this.tokenRepository.revokeRefreshToken(tokenHash);
    
    const user = await this.userRepository.findById(storedToken.userId);
    if (!user || !user.isActive)  throw new Error("Usuário bloqueado ou não encontrado.");
    
    const newAccessToken = await this.jwtProvider.sign({
      sub: user.id!,
      type: 'access',
      roleId: user.roleId,
      permissions: user.permissions || [],
    }, TimeInSeconds.FIVE_MINUTES);

    const newRefreshToken = await this.jwtProvider.sign({
      sub: user.id!,
      type: 'refresh',
    }, TimeInSeconds.THIRTY_DAYS);

    const newHasher = new Bun.CryptoHasher("sha256");
    const newHash = newHasher.update(newRefreshToken).digest("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 dias
    
    await this.tokenRepository.saveRefreshToken(user.id!, newHash, expiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

}
