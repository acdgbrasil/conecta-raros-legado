import { describe, test, expect } from "bun:test";
import { PermissionSlug } from "../../../permission/value_objects/PermissionSlug.vo";

describe("PermissionSlug Value Object", () => {
  test("should create a valid PermissionSlug", () => {
    const slugStr = "users:create";
    const permissionSlug = PermissionSlug.create(slugStr);
    expect(permissionSlug.value).toBe("users:create");
    expect(permissionSlug.toString()).toBe("users:create");
  });

  test("should normalize slug to lowercase and trim", () => {
    const permissionSlug = PermissionSlug.create("  Users:Delete  ");
    expect(permissionSlug.value).toBe("users:delete");
  });

  test("should throw error if slug is empty", () => {
    expect(() => PermissionSlug.create("")).toThrow("Permission slug cannot be empty.");
  });

  test("should throw error if format is invalid (missing colon)", () => {
    expect(() => PermissionSlug.create("userscreate")).toThrow("Invalid permission slug format");
  });

  test("should throw error if format is invalid (special chars)", () => {
    expect(() => PermissionSlug.create("users:create!")).toThrow("Invalid permission slug format");
    expect(() => PermissionSlug.create("users:create space")).toThrow("Invalid permission slug format");
  });

  test("should accept alphanumeric and underscores", () => {
    const validSlug = "reports_financial:export_csv";
    const permissionSlug = PermissionSlug.create(validSlug);
    expect(permissionSlug.value).toBe(validSlug);
  });
});
