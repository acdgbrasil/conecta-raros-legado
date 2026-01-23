export interface JwtPayload {
  sub: string;
  [key: string]: any;
}

export interface JwtProvider {
  /**
   * Gera um token assinado.
   * @param payload Objeto com dados do usuário
   * @param expiresInSeconds Tempo de vida em segundos (ex: 900 para 15min)
   */
  sign(payload: JwtPayload, expiresInSeconds: number): Promise<string>;

  /**
   * Verifica a assinatura e validade do token.
   * Lança erro se inválido.
   */
  verify(token: string): Promise<JwtPayload>;

  /**
   * Decodifica o token sem verificar a assinatura (Útil para debug ou client-side).
   * @returns O payload ou null se falhar.
   */
  decode(token: string): JwtPayload | null;
}