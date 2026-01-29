import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { IUserRepository } from "../../domain/user/user.repository";
import { TokenRepository } from "../../domain/authentication/repository/Token.repository";
import { JwtProvider } from "../../../shared/domain/services/JwtProvider.protocol";
import { RefreshTokenDTO } from "../mappers/auth/inputs/RefreshToken.input";
import { RefreshTokenResponseDTO } from "../mappers/auth/outputs/AuthResponses.output";
import { AuthMapper } from "../mappers/auth/Auth.mapper";
import { TimeInSeconds } from "../../../shared/constants/TimeInSeconds.constants";
import { createUserId } from "../../domain/types/identifiers";

/**
 * RefreshTokenUseCase - Renova o Access Token e implementa a Rotação de Refresh Token.
 */
export class RefreshTokenUseCase implements UseCaseProvider<RefreshTokenDTO, RefreshTokenResponseDTO> {
  
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly jwtProvider: JwtProvider
  ) {}

  async execute(input: RefreshTokenDTO): Promise<RefreshTokenResponseDTO> {
    // 1. Validação de Formato
    const data = AuthMapper.validateRefresh(input);

    // 2. Verificação do JWT
    const payload = await this.jwtProvider.verify<{ sub: string; type: string }>(data.refreshToken);
    if (payload.type !== 'refresh') {
      throw new Error("Invalid token type.");
    }

    // 3. Detecção de Reuso (Segurança)
    const hasher = new Bun.CryptoHasher("sha256");
    const currentHash = hasher.update(data.refreshToken).digest("hex");
    const storedToken = await this.tokenRepository.findRefreshToken(currentHash);

    if (!storedToken || storedToken.isRevoked) {
      // SECURITY: Se o token for inválido ou já tiver sido revogado (reuso),
      // revogamos TODOS os tokens daquele usuário como medida preventiva.
      if (storedToken) {
        await this.tokenRepository.revokeAllUserRefreshTokens(storedToken.userId);
      }
      throw new Error("Token invalid or already used. Please login again.");
    }

    // 4. Invalida o token atual (Consome o token)
    await this.tokenRepository.revokeRefreshToken(currentHash);

    // 5. Busca Usuário
    const user = await this.userRepository.findById(createUserId(storedToken.userId));
    if (!user || !user.isActive) {
      throw new Error("User blocked or not found.");
    }

    // 6. Gera Novo par de Tokens (Rotação)
    const newAccessToken = await this.jwtProvider.sign({
      sub: user.id,
      roleId: user.roleId,
      type: 'access'
    }, TimeInSeconds.FIVE_MINUTES);

    const newRefreshToken = await this.jwtProvider.sign({
      sub: user.id,
      type: 'refresh'
    }, TimeInSeconds.THIRTY_DAYS);

    // 7. Persiste o Novo Refresh Token
    const newHash = hasher.update(newRefreshToken).digest("hex");
    const expiresAt = new Date(Date.now() + (TimeInSeconds.THIRTY_DAYS * 1000));
    await this.tokenRepository.saveRefreshToken(user.id, newHash, expiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }
}