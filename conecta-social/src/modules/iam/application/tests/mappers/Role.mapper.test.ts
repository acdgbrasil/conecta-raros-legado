import { describe, test, expect } from "bun:test";
import { RoleMapper } from "../../mappers/role/Role.mapper";
import { ZodError } from "zod";

describe("RoleMapper", () => {
  const v7Id = "018e9c34-2e0b-70c8-8000-123456789000";
  const v7PermId = "018e9c34-2e0b-70c8-8000-123456789001";

  const validInput = {
    id: v7Id,
    name: "Admin",
    description: "System Administrator",
    isSystem: true,
    permissionIds: [v7PermId]
  };

  test("toDomain should convert valid input to RoleAggregate", () => {
    const role = RoleMapper.toDomain(validInput);
    
    expect(role.id).toBe(validInput.id);
    expect(role.name.value).toBe("Admin");
    expect(role.permissionIds.has(v7PermId as any)).toBe(true);
  });

  test("toResponse should convert RoleAggregate to DTO", () => {
    const role = RoleMapper.toDomain(validInput);
    const dto = RoleMapper.toResponse(role);

    expect(dto.id).toBe(validInput.id);
    expect(dto.name).toBe("Admin");
    expect(dto.permissionIds).toEqual(validInput.permissionIds);
  });

  test("toPersistence should convert Role to DB format using Codec", () => {
    const role = RoleMapper.toDomain(validInput);
    const db = RoleMapper.toPersistence(role);

    expect(db.id).toBe(validInput.id);
    expect(db.name).toBe("Admin");
    expect(db.is_system).toBe(true);
    expect(db.permission_ids).toEqual(validInput.permissionIds);
  });

  test("validateUpdate should parse valid partial input", () => {
    const updateInput = { id: v7Id, name: "New Name" };
    const parsed = RoleMapper.validateUpdate(updateInput);
    expect(parsed.name).toBe("New Name");
  });

  test("validateUpdate should throw on invalid ID", () => {
    const invalidInput = { id: "invalid", name: "New Name" };
    expect(() => RoleMapper.validateUpdate(invalidInput)).toThrow(ZodError);
  });
});