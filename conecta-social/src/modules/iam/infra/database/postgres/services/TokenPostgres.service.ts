import { TokenRepository } from "../../../../domain/authentication/repository/Token.repository";
import { pg } from "../../../../../shared/infra/postgres/client/postgres.client";

export class TokenPostgresRepository implements TokenRepository {
  
  async saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await pg`
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES (${userId}, ${tokenHash}, ${expiresAt.toISOString()})
    `;
    return Promise.resolve();
  }

  async findRefreshToken(tokenHash: string): Promise<{ userId: string; isRevoked: boolean; } | null> {
    const [row] = await pg`
      SELECT user_id, is_revoked 
      FROM refresh_tokens 
      WHERE token_hash = ${tokenHash} AND expires_at > NOW()
      LIMIT 1
    `;
    if (!row) return null;
    return { userId: row.user_id, isRevoked: row.is_revoked };
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await pg`UPDATE refresh_tokens SET is_revoked = true WHERE token_hash = ${tokenHash}`;
    return Promise.resolve();
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await pg`
      UPDATE refresh_tokens 
      SET is_revoked = true 
      WHERE user_id = ${userId}
    `;
    return Promise.resolve();
  }
}
