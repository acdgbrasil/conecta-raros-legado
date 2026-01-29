export interface JwtProvider {
  /**
   * Gera um token assinado.
   */
  sign(payload: Record<string, any>, expiresInSeconds: number): Promise<string>;

  /**
   * Verifica e decodifica um token.
   */
  verify<T>(token: string): Promise<T>;
}
