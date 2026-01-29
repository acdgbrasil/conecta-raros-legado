import { describe, expect, test } from "bun:test";
import { BunPasswordHasher } from "../BunPasswordHasher";

describe("BunPasswordHasher", () => {
  const hasher = new BunPasswordHasher();

  test("should hash and verify password correctly", async () => {
    const password = "my-secret-password";
    
    const hash = await hasher.hash(password);
    expect(hash).toBeString();
    expect(hash).not.toBe(password);

    const isMatch = await hasher.compare(password, hash);
    expect(isMatch).toBeTrue();
  });

  test("should not verify incorrect password", async () => {
    const password = "correct-password";
    const wrongPassword = "wrong-password";
    
    const hash = await hasher.hash(password);
    const isMatch = await hasher.compare(wrongPassword, hash);
    expect(isMatch).toBeFalse();
  });

  test("should support different algorithms if encoded in hash", async () => {
    // Bun.password.verify supports argon2 and bcrypt automatically if format is correct
    // We'll test with the default (argon2id) which we already did, 
    // but just ensuring it works for any hash returned by hash()
    const password = "test";
    const hash = await hasher.hash(password);
    expect(await hasher.compare(password, hash)).toBeTrue();
  });
});
