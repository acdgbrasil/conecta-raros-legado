import { decode, sign, verify } from "hono/jwt";
import { JwtPayload, JwtProvider } from "../../../../../shared/providers/jwt/Jwt.provider";
import { getSecret } from "../../../../../shared/infra/config/secrets";


export class HonoJwtService implements JwtProvider {
  private readonly secret: string;
  private readonly alg = 'HS256';

  constructor(){
    this.secret = getSecret('JWT_SECRET', 'DEFAULT_SECRET_CHANGE_ME');
    if (this.secret === 'DEFAULT_SECRET_CHANGE_ME') {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('❌ [FATAL] JWT_SECRET não configurado em ambiente de produção!');
      }
      console.warn('⚠️ [SECURITY] Usando segredo JWT padrão. Configure JWT_SECRET no .env!');
    }
  }

  async sign(payload: JwtPayload, expiresInSeconds: number): Promise<string> {
    const now = Math.floor(Date.now() / 1000); 
    const exp = now + expiresInSeconds;

    const finalPayload = {
      ...payload,
      iat: now,      
      exp: exp,      
      nbf: now - 1, 
    };

    return await sign(finalPayload, this.secret, this.alg as any);
  }
  async verify(token: string): Promise<JwtPayload> {
    try {
      // Se expirado ou assinatura ruim, o Hono lança erro aqui
      const payload = await verify(token, this.secret, this.alg as any);
      return payload as unknown as JwtPayload;
    } catch (error) {
      throw new Error('Token inválido ou expirado.');
    }
  }
  decode(token: string): JwtPayload | null {
    try {
      const { payload } = decode(token);
      return payload as unknown as JwtPayload;
    } catch (error) {
      return null;
    }
  }

}