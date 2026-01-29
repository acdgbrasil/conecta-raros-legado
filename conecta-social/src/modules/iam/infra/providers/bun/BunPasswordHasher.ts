import { PasswordHasher } from "@modules/shared/domain/services/PasswordHasher.protocol";


/**
 * BunPasswordHasher - Implementation using native Bun.password API.
 * 
 * Uses Argon2id by default, which is cryptographically secure and 
 * optimized by Bun's native implementation.
 * 
 * @see https://bun.sh/docs/api/hashing#bun-password
 */
export class BunPasswordHasher implements PasswordHasher {
  /**
   * Hashes a password using the default Argon2id algorithm.
   */
  async hash(plainText: string): Promise<string> {
    return await Bun.password.hash(plainText);
  }

  /**
   * Compares a plain text password with a stored hash.
   * Supports any algorithm encoded in the hash (Argon2, Bcrypt).
   */
  async compare(plainText: string, hash: string): Promise<boolean> {
    return await Bun.password.verify(plainText, hash);
  }
}
