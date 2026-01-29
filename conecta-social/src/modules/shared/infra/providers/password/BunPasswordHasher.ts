import { PasswordHasher } from "../../../domain/services/PasswordHasher.protocol";

export class BunPasswordHasher implements PasswordHasher {
  async hash(plainText: string): Promise<string> {
    return await Bun.password.hash(plainText, {
      algorithm: "argon2id",
      memoryCost: 65536,
      timeCost: 2
    });
  }

  async compare(plainText: string, hash: string): Promise<boolean> {
    return await Bun.password.verify(plainText, hash);
  }
}
