import { TokenRepository } from "@modules/iam/domain/authentication/repository/Token.repository";
import { pg } from "@modules/shared/infra/postgres/client/postgres.client";


export class PostgresTokenRepository implements TokenRepository {
  
  async saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await pg`
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES (${userId}, ${tokenHash}, ${expiresAt})
    `;
  }

  async findRefreshToken(tokenHash: string): Promise<{ userId: string; isRevoked: boolean } | null> {
    const rows = await pg`
      SELECT user_id as "userId", is_revoked as "isRevoked"
      FROM refresh_tokens 
      WHERE token_hash = ${tokenHash}
      LIMIT 1
    `;
    if (rows.length === 0) return null;
    return rows[0] as { userId: string; isRevoked: boolean };
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await pg`
      UPDATE refresh_tokens 
      SET is_revoked = true 
      WHERE token_hash = ${tokenHash}
    `;
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await pg`
      UPDATE refresh_tokens 
      SET is_revoked = true 
      WHERE user_id = ${userId} AND is_revoked = false
    `;
  }
}
