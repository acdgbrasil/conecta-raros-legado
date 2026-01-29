import { describe, test, expect } from "bun:test";
import { RoleName } from "../../../role/value_objects/RoleName.vo";

describe("RoleName Value Object", () => {
  test("should create a valid RoleName", () => {
    const nameStr = "Admin";
    const roleName = RoleName.create(nameStr);
    expect(roleName.value).toBe("Admin");
    expect(roleName.toString()).toBe("Admin");
  });

  test("should trim whitespace from input", () => {
    const roleName = RoleName.create("  Manager  ");
    expect(roleName.value).toBe("Manager");
  });

  test("should throw error if name is empty", () => {
    expect(() => RoleName.create("")).toThrow("Role name must be at least 3 characters long.");
    expect(() => RoleName.create("   ")).toThrow("Role name must be at least 3 characters long.");
  });

  test("should throw error if name is too short (< 3 chars)", () => {
    expect(() => RoleName.create("ab")).toThrow("Role name must be at least 3 characters long.");
  });

  test("should throw error if name is too long (> 50 chars)", () => {
    const longName = "a".repeat(51);
    expect(() => RoleName.create(longName)).toThrow("Role name must not exceed 50 characters.");
  });

  test("should check equality correctly (case insensitive)", () => {
    const role1 = RoleName.create("Admin");
    const role2 = RoleName.create("admin");
    const role3 = RoleName.create("Manager");

    expect(role1.equals(role2)).toBe(true);
    expect(role1.equals(role3)).toBe(false);
  });
});
