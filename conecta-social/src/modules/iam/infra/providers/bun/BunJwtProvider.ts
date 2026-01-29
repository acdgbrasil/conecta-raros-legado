import { JwtProvider } from "@modules/shared/domain/services/JwtProvider.protocol";


/**
 * BunJwtProvider - Lightweight JWT implementation using native Web Crypto API.
 * 
 * This avoids external dependencies and uses the optimized Web Crypto 
 * implementation provided by Bun (and standard modern runtimes).
 */
export class BunJwtProvider implements JwtProvider {
  private readonly secret: Uint8Array;

  constructor(secretKey: string) {
    if (!secretKey) throw new Error("JWT Secret key is required");
    this.secret = new TextEncoder().encode(secretKey);
  }

  /**
   * Signs a payload using HMAC SHA-256.
   */
  async sign(payload: Record<string, any>, expiresInSeconds: number): Promise<string> {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + expiresInSeconds;
    
    const header = { alg: "HS256", typ: "JWT" };
    const fullPayload = { ...payload, iat, exp };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(fullPayload));
    
    const data = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
    
    const key = await crypto.subtle.importKey(
      "raw",
      this.secret as BufferSource,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign("HMAC", key, data);
    const encodedSignature = this.base64UrlEncode(new Uint8Array(signature));

    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
  }

  /**
   * Verifies and decodes a JWT.
   */
  async verify<T>(token: string): Promise<T> {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid JWT format");

    const [header, payload, signature] = parts;
    const data = new TextEncoder().encode(`${header}.${payload}`);
    const sigData = this.base64UrlDecode(signature) as BufferSource;

    const key = await crypto.subtle.importKey(
      "raw",
      this.secret as BufferSource,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const isValid = await crypto.subtle.verify("HMAC", key, sigData, data);
    if (!isValid) throw new Error("Invalid JWT signature");

    const decodedPayload = JSON.parse(new TextDecoder().decode(this.base64UrlDecode(payload)));

    if (decodedPayload.exp && Math.floor(Date.now() / 1000) > decodedPayload.exp) {
      throw new Error("JWT expired");
    }

    return decodedPayload as T;
  }

  private base64UrlEncode(input: string | Uint8Array): string {
    const buffer = typeof input === "string" ? new TextEncoder().encode(input) : input;
    // Use Bun's optimized Buffer for base64url encoding
    return Buffer.from(buffer).toString("base64url");
  }

  private base64UrlDecode(input: string): Uint8Array {
    // Use Bun's optimized Buffer for base64url decoding
    return new Uint8Array(Buffer.from(input, "base64url"));
  }
}
