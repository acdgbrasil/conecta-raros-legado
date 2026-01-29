import { describe, test, expect } from "bun:test";
import { Email } from "../../../user/value_objects/Email.vo";

describe("Email Value Object", () => {
  test("should create a valid Email", () => {
    const email = Email.create("user@example.com");
    expect(email.value).toBe("user@example.com");
  });

  test("should normalize email (trim and lowercase)", () => {
    const email = Email.create("  User@Example.COM  ");
    expect(email.value).toBe("user@example.com");
  });

  test("should throw error for invalid email format", () => {
    expect(() => Email.create("invalid-email")).toThrow("Invalid email format");
    expect(() => Email.create("user@.com")).toThrow("Invalid email format");
    expect(() => Email.create("@example.com")).toThrow("Invalid email format");
  });

  test("should throw error for empty email", () => {
    expect(() => Email.create("")).toThrow("Email cannot be empty");
  });

  test("should check equality", () => {
    const email1 = Email.create("test@test.com");
    const email2 = Email.create("TEST@test.com");
    expect(email1.equals(email2)).toBe(true);
  });
});
