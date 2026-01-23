import { describe, expect, it } from "bun:test";
import { CreateUserInputSchema } from "../mapper/user/User.input";
import { LoginInputSchema } from "../mapper/auth/Auth.input";
import { SendNotificationEmailInputSchema } from "../../notifications/mapper/Notification.input";
import { UserResponseSchema } from "../mapper/user/User.output";

describe("IAM & Notifications Data Quality - Zod v4 Migration", () => {
  
  describe("IAM: CreateUserInputSchema", () => {
    it("should reject an invalid email format", () => {
      const result = CreateUserInputSchema.safeParse({
        name: "User Test",
        email: "not-an-email",
        roleId: "018e9c32-1b0e-7447-8a62-7231d1b12345", // Valid UUID v7
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Formato de e-mail inválido");
      }
    });

    it("should reject a generic UUID v4 for roleId (Must be v7 specified in docs intention)", () => {
      // Note: Zod .uuidv7() strictly validates v7 version bits
      const result = CreateUserInputSchema.safeParse({
        name: "User Test",
        email: "test@example.com",
        roleId: "447e1997-8c33-4f93-9c8a-f5a6390141f2", // Valid UUID v4 but schema expects v7
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod v4 returns 'invalid_format' for UUID version mismatch
        expect(result.error.issues[0].code).toBe("invalid_format");
      }
    });

    it("should accept valid data with UUID v7", () => {
      const validData = {
        name: "User Test",
        email: "test@example.com",
        roleId: "018e9c32-1b0e-7447-8a62-7231d1b12345", // Valid UUID v7
      };
      const result = CreateUserInputSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("Notifications: SendNotificationEmailInputSchema", () => {
    it("should reject empty content", () => {
      const result = SendNotificationEmailInputSchema.safeParse({
        recipient: "test@example.com",
        channel: "EMAIL",
        content: ""
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Conteúdo da notificação é obrigatório");
      }
    });

    it("should reject invalid notification channel", () => {
      const result = SendNotificationEmailInputSchema.safeParse({
        recipient: "test@example.com",
        channel: "CARRIER_PIGEON",
        content: "Hello"
      });
      expect(result.success).toBe(false);
    });
  });

  describe("IAM: UserResponseSchema (Output Protection)", () => {
    it("should strip unauthorized fields if passed to response mapper", () => {
      const rawData = {
        id: "018e9c32-1b0e-7447-8a62-7231d1b12345",
        name: "Maria Souza",
        email: "maria@example.com",
        roleId: "018e9c32-1b0e-7447-8a62-7231d1b12345",
        permissions: [],
        isActive: true,
        requiresReset: false,
        passwordHash: "SECRET_HASH" // Should be ignored by parse if not in schema
      };
      
      const result = UserResponseSchema.safeParse(rawData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty("passwordHash");
      }
    });
  });

  describe("Shared: PasswordStrongSchema", () => {
    it("should reject weak passwords", () => {
      const result = LoginInputSchema.safeParse({
        email: "test@example.com",
        password: "123"
      });
      expect(result.success).toBe(false);
    });

    it("should accept strong passwords with special chars", () => {
      const result = LoginInputSchema.safeParse({
        email: "test@example.com",
        password: "StrongP@ssw0rd1"
      });
      expect(result.success).toBe(true);
    });
  });

});