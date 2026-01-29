import { describe, test, expect, mock, beforeEach } from "bun:test";
import { ForgotPasswordUseCase } from "../../useCases/ForgotPassword.useCase";
import { IUserRepository } from "../../../domain/user/user.repository";
import { RecoveryRepository } from "../../../domain/authentication/repository/Recovery.repository";
import { EventBus } from "../../../../shared/domain/events/EventBus.protocol";
import { UserMapper } from "../../mappers/user/User.mapper";

describe("ForgotPasswordUseCase", () => {
  let userRepository: IUserRepository;
  let recoveryRepository: RecoveryRepository;
  let eventBus: EventBus;
  let useCase: ForgotPasswordUseCase;

  const v7Id = "018e9c34-2e0b-70c8-8000-123456789000";
  const mockUser = {
    id: v7Id, 
    person_id: v7Id, 
    name: "User", 
    email: "user@test.com",
    password_hash: "h", 
    role_id: v7Id, 
    is_active: true,
    force_change_password: false, 
    job_title: "A", 
    department: "D", 
    last_login_at: new Date(),
    created_at: new Date(), 
    updated_at: new Date()
  };

  beforeEach(() => {
    userRepository = {
      findByEmail: mock(async () => UserMapper.fromPersistence(mockUser))
    } as any;

    recoveryRepository = {
      createRecoveryCode: mock(() => "123456"),
      saveRecoveryCode: mock(async () => {})
    } as any;

    eventBus = { publish: mock(async () => {}) } as any;

    useCase = new ForgotPasswordUseCase(userRepository, recoveryRepository, eventBus);
  });

  test("should generate OTP and publish event for valid email", async () => {
    const result = await useCase.execute({ email: "user@test.com" });

    expect(result.message).toContain("receive a recovery code");
    expect(recoveryRepository.saveRecoveryCode).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalled();
  });

  test("should fail silently if user not found", async () => {
    (userRepository.findByEmail as any).mockImplementation(() => Promise.resolve(null));

    const result = await useCase.execute({ email: "nonexistent@test.com" });

    expect(result.message).toContain("receive a recovery code"); // Resposta igual
    expect(recoveryRepository.saveRecoveryCode).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
