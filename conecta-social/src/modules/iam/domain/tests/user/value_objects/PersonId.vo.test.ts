import { describe, test, expect } from "bun:test";
import { PersonId } from "../../../user/value_objects/PersonId.vo";

describe("PersonId Value Object", () => {
  test("should create a valid PersonId (UUID)", () => {
    const uuid = "123e4567-e89b-12d3-a456-426614174000";
    const personId = PersonId.create(uuid);
    expect(personId.value).toBe(uuid);
  });

  test("should throw error for invalid UUID", () => {
    expect(() => PersonId.create("invalid-uuid")).toThrow("Person ID must be a valid UUID");
    expect(() => PersonId.create("12345")).toThrow("Person ID must be a valid UUID");
  });
});
