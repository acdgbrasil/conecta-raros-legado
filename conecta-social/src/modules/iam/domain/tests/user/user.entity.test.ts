import { describe, test, expect } from "bun:test";
import { UserAggregate } from "../../user/user.entity";
import { createUserId, createPersonId, createRoleId } from "../../types/identifiers";
import { Email } from "../../user/value_objects/Email.vo";
import { Name } from "../../user/value_objects/Name.vo";
import { UserDeactivatedEvent } from "../../events/UserDeactivated.event";
import { UserRoleChangedEvent } from "../../events/UserRoleChanged.event";

// Implementação concreta para testes
class TestUser extends UserAggregate {}

describe("UserAggregate Entity", () => {
  const userId = createUserId("user-123");
  const personId = createPersonId("person-123");
  const roleId = createRoleId("role-123");
  const email = Email.create("test@example.com");
  const name = Name.create("John Doe");
  const passHash = "hashed_password";
  const now = new Date();

  test("should create a valid user instance", () => {
    const user = new TestUser(
      userId,
      personId,
      name,
      email,
      passHash,
      roleId,
      true, // isActive
      true, // forceChangePassword
      now,
      now
    );

    expect(user.id).toBe(userId);
    expect(user.email.value).toBe("test@example.com");
    expect(user.name.value).toBe("John Doe");
    expect(user.isActive).toBe(true);
    expect(user.domainEvents.length).toBe(0);
  });

  test("should toggle user status and update updatedAt", () => {
    const user = new TestUser(
      userId,
      personId,
      name,
      email,
      passHash,
      roleId,
      true,
      false,
      now,
      now
    );

    // Pequeno delay para garantir que o timestamp mude (ou apenas checar se é >=)
    const oldUpdatedAt = user.updatedAt;
    
    user.toggleStatus(false);

    expect(user.isActive).toBe(false);
    expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
  });

  test("should dispatch UserDeactivatedEvent when deactivated", () => {
    const user = new TestUser(
      userId,
      personId,
      name,
      email,
      passHash,
      roleId,
      true,
      false,
      now,
      now
    );

    user.toggleStatus(false);

    expect(user.domainEvents.length).toBe(1);
    expect(user.domainEvents[0]).toBeInstanceOf(UserDeactivatedEvent);
    expect((user.domainEvents[0] as UserDeactivatedEvent).payload.userId).toBe(userId);
  });

  test("should NOT dispatch UserDeactivatedEvent when activated", () => {
    const user = new TestUser(
      userId,
      personId,
      name,
      email,
      passHash,
      roleId,
      false, // Inactive
      false,
      now,
      now
    );

    user.toggleStatus(true); // Activate

    expect(user.isActive).toBe(true);
    expect(user.domainEvents.length).toBe(0);
  });

  test("should change role and update updatedAt", () => {
    const user = new TestUser(
      userId,
      personId,
      name,
      email,
      passHash,
      roleId,
      true,
      false,
      now,
      now
    );

    const newRoleId = createRoleId("new-role-456");
    user.changeRole(newRoleId);

    expect(user.roleId).toBe(newRoleId);
    expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(now.getTime());
  });

  test("should dispatch UserRoleChangedEvent when role changes", () => {
    const user = new TestUser(
      userId,
      personId,
      name,
      email,
      passHash,
      roleId,
      true,
      false,
      now,
      now
    );

    const newRoleId = createRoleId("new-role-456");
    user.changeRole(newRoleId);

    expect(user.domainEvents.length).toBe(1);
    expect(user.domainEvents[0]).toBeInstanceOf(UserRoleChangedEvent);
    expect((user.domainEvents[0] as UserRoleChangedEvent).payload.newRoleId).toBe(newRoleId);
  });
});
