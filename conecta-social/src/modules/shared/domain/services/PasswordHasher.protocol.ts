export interface PasswordHasher {
  /**
   * Gera o hash de uma senha em texto plano.
   */
  hash(plainText: string): Promise<string>;

  /**
   * Verifica se uma senha em texto plano corresponde ao hash fornecido.
   */
  compare(plainText: string, hash: string): Promise<boolean>;
}
