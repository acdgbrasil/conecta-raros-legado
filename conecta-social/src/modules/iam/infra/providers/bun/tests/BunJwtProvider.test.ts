import { describe, expect, test } from "bun:test";
import { BunJwtProvider } from "../BunJwtProvider";

describe("BunJwtProvider", () => {
  const secret = "test-secret-key-123456";
  const provider = new BunJwtProvider(secret);

  test("should sign and verify a payload correctly", async () => {
    const payload = { sub: "user-123", role: "admin" };
    
    // Sign
    const token = await provider.sign(payload, 60);
    expect(token).toBeString();
    expect(token.split(".")).toHaveLength(3);

    // Verify
    const decoded = await provider.verify<{ sub: string; role: string }>(token);
    expect(decoded.sub).toBe("user-123");
    expect(decoded.role).toBe("admin");
  });

  test("should throw error for expired token", async () => {
    const payload = { sub: "user-expired" };
    // Token expires in -1 second (already expired)
    const token = await provider.sign(payload, -1); 

    // Expect verification to fail
    expect(provider.verify(token)).rejects.toThrow("JWT expired");
  });

  test("should throw error for invalid signature", async () => {
    const token = await provider.sign({ sub: "valid" }, 60);
    const parts = token.split(".");
    // Tamper with the payload part
    parts[1] = Buffer.from(JSON.stringify({ sub: "hacked" })).toString("base64url");
    const tamperedToken = parts.join(".");

    expect(provider.verify(tamperedToken)).rejects.toThrow();
  });
});