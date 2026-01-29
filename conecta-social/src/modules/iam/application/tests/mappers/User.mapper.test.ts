import { describe, test, expect, mock } from "bun:test";
import { UserMapper } from "../../mappers/user/User.mapper";
import { ZodError } from "zod";
import { PasswordHasher } from "../../../../shared/domain/services/PasswordHasher.protocol";

describe("UserMapper", () => {
  // Mock do PasswordHasher
  const mockHasher: PasswordHasher = {
    hash: mock(async (p) => `hashed_${p}`),
    compare: mock(async (p, h) => `hashed_${p}` === h)
  };

  const v7Id = "018e9c34-2e0b-70c8-8000-123456789000";
  const validInput = {
    id: v7Id,
    personId: "018e9c34-2e0b-70c8-8000-123456789001",
    name: "John Mapper",
    email: "mapper@test.com",
    password: "StrongP@ss123", // Agora passamos a senha plana
    roleId: "018e9c34-2e0b-70c8-8000-123456789002",
    isActive: true,
    forceChangePassword: false
  };

  test("toDomain should convert valid input to UserAggregate and hash password", async () => {
    const user = await UserMapper.toDomain(validInput, mockHasher);
    
    expect(user.id).toBe(validInput.id);
    expect(user.passwordHash).toBe("hashed_StrongP@ss123");
    expect(user.domainEvents.length).toBe(1);
    expect(user.domainEvents[0].eventName).toBe("UserCreated");
  });

  test("toDomain should generate a password if not provided", async () => {
    const inputWithoutPass = { ...validInput, password: undefined };
    const user = await UserMapper.toDomain(inputWithoutPass, mockHasher);
    
    expect(user.passwordHash).toBeDefined();
    expect(user.passwordHash).toContain("hashed_");
    
    const event = user.domainEvents[0] as any;
    expect(event.payload.plainPassword).toBeDefined();
    expect(event.payload.plainPassword.length).toBeGreaterThan(10);
  });

  test("toDomain should throw ZodError on invalid email", async () => {
    const invalidInput = { ...validInput, email: "invalid-mail" };
    expect(UserMapper.toDomain(invalidInput, mockHasher)).rejects.toThrow(ZodError);
  });

  test("toResponse should convert UserAggregate to DTO", async () => {
    const user = await UserMapper.toDomain(validInput, mockHasher);
    const dto = UserMapper.toResponse(user);

    expect(dto.id).toBe(validInput.id);
    expect(dto.name).toBe(validInput.name);
    expect(dto.email).toBe(validInput.email);
    expect(dto).toHaveProperty("createdAt");
  });

  test("toPersistence should convert UserAggregate to Database format", async () => {
    const user = await UserMapper.toDomain(validInput, mockHasher);
    const persistence = UserMapper.toPersistence(user);

    expect(persistence.id).toBe(validInput.id);
    expect(persistence.password_hash).toBe("hashed_StrongP@ss123");
  });
});