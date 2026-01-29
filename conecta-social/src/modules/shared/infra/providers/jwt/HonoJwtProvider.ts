import { JwtProvider } from "modules/shared/domain/services/JwtProvider.protocol";

export class HonoJwtProvider implements JwtProvider {
  private readonly secret: string;

  constructor() {
    this.secret = Bun.env.JWT_SECRET || "default_insecure_secret_change_me";
  }
  sign(payload: Record<string, any>, expiresInSeconds: number): Promise<string> {
    throw new Error("Method not implemented.");
  }
  verify<T>(token: string): Promise<T> {
    throw new Error("Method not implemented.");
  }

}
