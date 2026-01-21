export interface TokenRepository {
  /**
   * Salva um hash de refresh token associado a um usuário.
   */
  saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;

  /**
   * Busca um refresh token pelo hash.
   */
  findRefreshToken(tokenHash: string): Promise<{ userId: string; isRevoked: boolean } | null>;

  /**
   * Revoga (invalida) um refresh token específico.
   */
  revokeRefreshToken(tokenHash: string): Promise<void>;

  /**
   * Revoga (invalida) TODOS os refresh tokens de um usuário.
   * Usado para segurança (Logout geral, troca de senha, detecção de roubo).
   */
  revokeAllUserRefreshTokens(userId: string): Promise<void>;
}
