import { describe, test, expect } from "bun:test";
import { RoleAggregate } from "../../role/role.entity";
import { createRoleId, createPermissionId, RoleId, PermissionId } from "../../types/identifiers";
import { RoleName } from "../../role/value_objects/RoleName.vo";
import { RolePermissionsUpdatedEvent } from "../../events/RolePermissionsUpdated.event";

// Concrete implementation for testing abstract class
class TestRole extends RoleAggregate {}

describe("RoleAggregate Entity", () => {
  const roleId = createRoleId("role-123");
  const roleName = RoleName.create("Editor");
  const createdAt = new Date();
  const perm1 = createPermissionId("perm-1");
  const perm2 = createPermissionId("perm-2");

  describe("Custom Role (Mutable)", () => {
    test("should allow renaming", () => {
      const role = new TestRole(
        roleId,
        roleName,
        "Description",
        false, // isSystem = false
        new Set([perm1]),
        createdAt
      );

      const newName = RoleName.create("Super Editor");
      role.rename(newName);

      expect(role.name.value).toBe("Super Editor");
    });

    test("should allow updating permissions", () => {
      const role = new TestRole(
        roleId,
        roleName,
        "Description",
        false,
        new Set([perm1]),
        createdAt
      );

      const newPerms = new Set<PermissionId>([perm1, perm2]);
      role.updatePermissions(newPerms);

      expect(role.permissionIds.size).toBe(2);
      expect(role.permissionIds.has(perm2)).toBe(true);
    });

    test("should dispatch RolePermissionsUpdatedEvent on update", () => {
      const role = new TestRole(
        roleId,
        roleName,
        "Description",
        false,
        new Set([perm1]),
        createdAt
      );

      const newPerms = new Set<PermissionId>([perm1, perm2]);
      role.updatePermissions(newPerms);

      expect(role.domainEvents.length).toBe(1);
      expect(role.domainEvents[0]).toBeInstanceOf(RolePermissionsUpdatedEvent);
      
      const eventPayload = (role.domainEvents[0] as RolePermissionsUpdatedEvent).payload;
      expect(eventPayload.roleId).toBe(roleId);
      expect(eventPayload.permissionIds.length).toBe(2);
    });

    test("should be deletable", () => {
      const role = new TestRole(
        roleId,
        roleName,
        "Description",
        false,
        new Set(),
        createdAt
      );

      expect(role.canBeDeleted()).toBe(true);
    });
  });

  describe("System Role (Immutable)", () => {
    test("should NOT allow renaming", () => {
      const role = new TestRole(
        roleId,
        RoleName.create("SystemAdmin"),
        "System Role",
        true, // isSystem = true
        new Set([perm1]),
        createdAt
      );

      const newName = RoleName.create("HackedAdmin");
      
      expect(() => role.rename(newName)).toThrow("System roles cannot be renamed.");
    });

    test("should NOT allow updating permissions directly", () => {
      const role = new TestRole(
        roleId,
        RoleName.create("SystemAdmin"),
        "System Role",
        true,
        new Set([perm1]),
        createdAt
      );

      const newPerms = new Set<PermissionId>([perm2]);
      
      expect(() => role.updatePermissions(newPerms)).toThrow("System roles cannot have permissions modified directly.");
    });

    test("should NOT be deletable", () => {
      const role = new TestRole(
        roleId,
        RoleName.create("SystemAdmin"),
        "System Role",
        true,
        new Set(),
        createdAt
      );

      expect(role.canBeDeleted()).toBe(false);
    });
  });
});
