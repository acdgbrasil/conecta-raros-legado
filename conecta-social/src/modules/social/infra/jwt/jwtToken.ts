import { sign, verify } from 'hono/jwt';
import { JWTPayload } from 'hono/utils/jwt/types';
import { getSecret } from '../../../shared/infra/config/secrets';

export class JwtToken {
  private readonly secret: string;
  private readonly alg: string = 'HS256';

  constructor() {
    this.secret = getSecret('JWT_SECRET', 'CHANGE_ME_IN_PROD_PLEASE');
  }

  /**
   * Gera um Token.
   * @param payload Dados do usuário
   * @param expiresInSeconds Tempo em segundos (Default 15 min para Access, use muito mais para Refresh)
   */
  async sign(payload: object, expiresInSeconds: number = 60 * 15): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + expiresInSeconds;

    const finalPayload = {
      ...payload,
      iat: now,
      exp: exp, 
    };

    return await sign(finalPayload, this.secret, this.alg as any);
  }

  async verify(token: string): Promise<JWTPayload> {
    try {
      return await verify(token, this.secret, this.alg as any);
    } catch (e) {
      throw new Error('Token inválido ou expirado.');
    }
  }
}