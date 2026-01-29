import { pg } from "@modules/shared/infra/postgres/client/postgres.client";
import { RecoveryRepository } from "@modules/iam/domain/authentication/repository/Recovery.repository";

export class PostgresRecoveryRepository implements RecoveryRepository {
  
  async saveRecoveryCode(userId: string, code: string, expiresAt: Date): Promise<void> {
    await pg`
      INSERT INTO recovery_codes (user_id, code, expires_at)
      VALUES (${userId}, ${code}, ${expiresAt})
    `;
  }

  async findValidRecoveryCode(userId: string, code: string): Promise<{ id: string } | null> {
    const rows = await pg`
      SELECT id FROM recovery_codes
      WHERE user_id = ${userId} 
        AND code = ${code} 
        AND used = false 
        AND expires_at > NOW()
      LIMIT 1
    `;
    if (rows.length === 0) return null;
    return rows[0] as { id: string };
  }

  async markRecoveryCodeAsUsed(id: string): Promise<void> {
    await pg`
      UPDATE recovery_codes 
      SET used = true 
      WHERE id = ${id}
    `;
  }

  /**
   * Gera um código numérico aleatório de 6 dígitos.
   */
  createRecoveryCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
