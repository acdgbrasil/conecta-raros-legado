import { describe, test, expect } from "bun:test";
import { PermissionMapper } from "../../mappers/permission/Permission.mapper";
import { ZodError } from "zod";

describe("PermissionMapper", () => {
  const v7Id = "018e9c34-2e0b-70c8-8000-123456789000";

  const validInput = {
    id: v7Id,
    slug: "users:create",
    description: "Can create users",
    module: "users"
  };

  test("toDomain should convert valid input to Permission", () => {
    const perm = PermissionMapper.toDomain(validInput);
    expect(perm.slug.value).toBe("users:create");
  });

  test("toDomain should throw ZodError on invalid slug format", () => {
    const invalidInput = { ...validInput, slug: "invalid slug" };
    expect(() => PermissionMapper.toDomain(invalidInput)).toThrow(ZodError);
  });

  test("toDomain should throw ZodError on invalid UUID version (v4)", () => {
    const invalidInput = { 
        ...validInput, 
        id: "123e4567-e89b-12d3-a456-426614174000" 
    };
    expect(() => PermissionMapper.toDomain(invalidInput)).toThrow(ZodError);
  });

  test("toResponse should convert Permission to DTO", () => {
    const perm = PermissionMapper.toDomain(validInput);
    const dto = PermissionMapper.toResponse(perm);
    expect(dto.slug).toBe("users:create");
  });

  test("toPersistence should convert Permission to DB format using Codec", () => {
    const perm = PermissionMapper.toDomain(validInput);
    const db = PermissionMapper.toPersistence(perm);

    expect(db.id).toBe(validInput.id);
    expect(db.slug).toBe("users:create");
  });
});
