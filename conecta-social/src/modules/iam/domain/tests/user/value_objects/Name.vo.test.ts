import { describe, test, expect } from "bun:test";
import { Name } from "../../../user/value_objects/Name.vo";

describe("Name Value Object", () => {
  test("should create a valid Name", () => {
    const name = Name.create("John Doe");
    expect(name.value).toBe("John Doe");
  });

  test("should trim whitespace", () => {
    const name = Name.create("  Jane Doe  ");
    expect(name.value).toBe("Jane Doe");
  });

  test("should throw error if name is too short", () => {
    expect(() => Name.create("J")).toThrow("Name must be at least 2 characters long");
  });

  test("should throw error if name is too long", () => {
    const longName = "a".repeat(101);
    expect(() => Name.create(longName)).toThrow("Name must not exceed 100 characters");
  });
});
