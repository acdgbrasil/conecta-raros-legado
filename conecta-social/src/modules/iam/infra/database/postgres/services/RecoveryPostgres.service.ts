import { RecoveryRepository } from "../../../../domain/authentication/repository/Recovery.repository";
import { pg } from "../../../../../shared/infra/postgres/client/postgres.client";
import { randomInt } from "node:crypto";

export class RecoveryPostgresRepository implements RecoveryRepository {
  createRecoveryCode(): string {
    //TODO: USAR UMA LIB DE CÓDIGO TEMPORÁRIO MAIS SEGURO DO BUN
    const code = randomInt(100000, 1000000).toString();
    return code;
  }
  
  async saveRecoveryCode(userId: string, code: string, expiresAt: Date): Promise<void> {
    await pg`
      INSERT INTO recovery_codes (user_id, code, expires_at)
      VALUES (${userId}, ${code}, ${expiresAt.toISOString()})
    `;
    return Promise.resolve();
  }
  
  async findValidRecoveryCode(userId: string, code: string): Promise<{ id: string; } | null> {
    const [row] = await pg`
      SELECT id FROM recovery_codes
      WHERE user_id = ${userId} 
        AND code = ${code} 
        AND used = false 
        AND expires_at > NOW()
      LIMIT 1
    `;
    if (!row) return null;
    return { id: row.id };
  }
  
  async markRecoveryCodeAsUsed(id: string): Promise<void> {
    await pg`UPDATE recovery_codes SET used = true WHERE id = ${id}`;
    return Promise.resolve();
  }
}
