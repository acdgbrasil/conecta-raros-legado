export interface RecoveryRepository {
  /**
   * Salva um código de recuperação (OTP) para um usuário (via ID).
   */
  saveRecoveryCode(userId: string, code: string, expiresAt: Date): Promise<void>;

  /**
   * Busca um código válido (não expirado e não usado) para o usuário.
   */
  findValidRecoveryCode(userId: string, code: string): Promise<{ id: string } | null>;

  /**
   * Marca um código como utilizado para evitar reuso.
   */
  markRecoveryCodeAsUsed(id: string): Promise<void>;

  createRecoveryCode(): string;
}
