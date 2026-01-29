import { describe, test, expect } from "bun:test";
import { AuthMapper } from "../../mappers/auth/Auth.mapper";
import { ZodError } from "zod";

describe("AuthMapper", () => {
  const strongPass = "StrongP@ss1";

  test("validateLogin should accept valid credentials", () => {
    const input = { email: "test@test.com", password: strongPass };
    const parsed = AuthMapper.validateLogin(input);
    expect(parsed.email).toBe(input.email);
  });

  test("validateLogin should reject weak passwords", () => {
    const input = { email: "test@test.com", password: "weak" };
    expect(() => AuthMapper.validateLogin(input)).toThrow(ZodError);
  });

  test("validateResetPassword should enforce 6-digit code", () => {
    const input = { email: "test@test.com", code: "123", newPassword: strongPass };
    expect(() => AuthMapper.validateResetPassword(input)).toThrow("Código deve ter exatamente 6 dígitos");
  });

  test("validateForgotPassword should require valid email", () => {
    const input = { email: "invalid" };
    expect(() => AuthMapper.validateForgotPassword(input)).toThrow(ZodError);
  });
});
