import { describe, test, expect } from "bun:test";
import { Password } from "../../../user/value_objects/Password.vo";

describe("Password Value Object", () => {
  test("should create a valid strong password", () => {
    const pass = Password.create("Strong@123");
    expect(pass.getValue()).toBe("Strong@123");
  });

  test("should throw error if password is too short (< 8 chars)", () => {
    expect(() => Password.create("Ab1@")).toThrow("Password must be at least 8 characters long.");
  });

  test("should throw error if password has no uppercase letter", () => {
    expect(() => Password.create("strong@123")).toThrow("Password must contain at least one uppercase letter.");
  });

  test("should throw error if password has no lowercase letter", () => {
    expect(() => Password.create("STRONG@123")).toThrow("Password must contain at least one lowercase letter.");
  });

  test("should throw error if password has no special character", () => {
    expect(() => Password.create("Strong123")).toThrow("Password must contain at least one special character.");
  });

  test("should throw error if password is empty", () => {
    expect(() => Password.create("")).toThrow("Password cannot be empty.");
  });

  test("should throw error if password is too long (> 100 chars)", () => {
    const longPass = "A".repeat(50) + "a".repeat(50) + "@" + "1";
    expect(() => Password.create(longPass)).toThrow("Password is too long.");
  });
});
