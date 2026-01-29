import { describe, expect, test } from "bun:test";
import { AuthMapper } from "../Auth.mapper";

describe("TokenPayload Mapper & Schema", () => {
  const validPayload = {
    sub: "018e9c32-1b0e-7447-8a62-7231d1b12345", 
    roleId: "018e9c32-1b0e-7447-8a62-7231d1b12346",
    type: "access",
    permissions: ["users:read", "users:create"]
  };

  test("should validate a correct token payload", () => {
    // @ts-ignore - Método ainda não existe (TDD)
    const result = (AuthMapper as any).validateTokenPayload(validPayload);
    
    expect(result.sub).toBe(validPayload.sub);
    expect(result.type).toBe("access");
    expect(result.permissions).toContain("users:read");
  });

  test("should allow payload without optional permissions (defaulting to empty array)", () => {
    const { permissions, ...minimalPayload } = validPayload;
    // @ts-ignore
    const result = (AuthMapper as any).validateTokenPayload(minimalPayload);
    
    expect(result.permissions).toBeArray();
    expect(result.permissions).toHaveLength(0);
  });

  test("should throw error if sub is not a valid UUID", () => {
    const invalidPayload = { ...validPayload, sub: "invalid-uuid" };
    // @ts-ignore
    expect(() => (AuthMapper as any).validateTokenPayload(invalidPayload)).toThrow();
  });

  test("should throw error if type is not access or refresh", () => {
    const invalidPayload = { ...validPayload, type: "wrong-type" };
    // @ts-ignore
    expect(() => (AuthMapper as any).validateTokenPayload(invalidPayload)).toThrow();
  });

  test("should accept payload with JWT claims (iat, exp)", () => {
    const payloadWithClaims = {
      ...validPayload,
      iat: 1700000000,
      exp: 1700003600
    };
    // @ts-ignore
    const result = (AuthMapper as any).validateTokenPayload(payloadWithClaims);
    expect(result.iat).toBe(1700000000);
  });
});
