import { describe, test, expect, mock, beforeEach } from "bun:test";
import { ResetPasswordUseCase } from "../../useCases/ResetPassword.useCase";
import { IUserRepository } from "../../../domain/user/user.repository";
import { RecoveryRepository } from "../../../domain/authentication/repository/Recovery.repository";
import { TokenRepository } from "../../../domain/authentication/repository/Token.repository";
import { PasswordHasher } from "../../../../shared/domain/services/PasswordHasher.protocol";
import { EventBus } from "../../../../shared/domain/events/EventBus.protocol";
import { UserMapper } from "../../mappers/user/User.mapper";

describe("ResetPasswordUseCase", () => {
  let userRepository: IUserRepository;
  let recoveryRepository: RecoveryRepository;
  let tokenRepository: TokenRepository;
  let passwordHasher: PasswordHasher;
  let eventBus: EventBus;
  let useCase: ResetPasswordUseCase;

  const v7Id = "018e9c34-2e0b-70c8-8000-123456789000";
  const mockUser = {
    id: v7Id, 
    person_id: v7Id, 
    name: "User", 
    email: "user@test.com",
    password_hash: "old_h", 
    role_id: v7Id, 
    is_active: true,
    force_change_password: true, 
    job_title: "A", 
    department: "D", 
    last_login_at: new Date(),
    created_at: new Date(), 
    updated_at: new Date()
  };

  beforeEach(() => {
    userRepository = {
      findByEmail: mock(async () => UserMapper.fromPersistence(mockUser)),
      save: mock(async () => {})
    } as any;

    recoveryRepository = {
      findValidRecoveryCode: mock(async () => ({ id: "code-id" })),
      markRecoveryCodeAsUsed: mock(async () => {})
    } as any;

    tokenRepository = { revokeAllUserRefreshTokens: mock(async () => {}) } as any;
    passwordHasher = { hash: mock(async (p) => `new_h_${p}`), compare: mock() };
    eventBus = { publish: mock(async () => {}) } as any;

    useCase = new ResetPasswordUseCase(userRepository, recoveryRepository, tokenRepository, passwordHasher, eventBus);
  });

  test("should reset password and revoke sessions", async () => {
    const input = { email: "user@test.com", code: "123456", newPassword: "StrongPassword1!" };
    const result = await useCase.execute(input);

    expect(result.message).toBe("Password reset successfully.");
    expect(userRepository.save).toHaveBeenCalled();
    expect(tokenRepository.revokeAllUserRefreshTokens).toHaveBeenCalledWith(v7Id);
  });

  test("should throw error for invalid OTP code", async () => {
    (recoveryRepository.findValidRecoveryCode as any).mockImplementation(() => Promise.resolve(null));

    const input = { email: "user@test.com", code: "123456", newPassword: "StrongPassword1!" };
    expect(useCase.execute(input)).rejects.toThrow("Invalid or expired recovery code");
  });
});
