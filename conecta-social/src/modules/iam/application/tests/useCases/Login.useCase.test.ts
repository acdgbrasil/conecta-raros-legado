import { describe, test, expect, mock, beforeEach } from "bun:test";
import { LoginUseCase } from "../../useCases/Login.useCase";
import { IUserRepository } from "../../../domain/user/user.repository";
import { TokenRepository } from "../../../domain/authentication/repository/Token.repository";
import { PasswordHasher } from "../../../../shared/domain/services/PasswordHasher.protocol";
import { JwtProvider } from "../../../../shared/domain/services/JwtProvider.protocol";
import { EventBus } from "../../../../shared/domain/events/EventBus.protocol";
import { UserMapper } from "../../mappers/user/User.mapper";

describe("LoginUseCase", () => {
  let userRepository: IUserRepository;
  let tokenRepository: TokenRepository;
  let passwordHasher: PasswordHasher;
  let jwtProvider: JwtProvider;
  let eventBus: EventBus;
  let useCase: LoginUseCase;

  const v7Id = "018e9c34-2e0b-70c8-8000-123456789000";
  
  // Mock do usuário retornado pelo repositório (completar todos os campos para o Codec)
  const mockUserRaw = {
    id: v7Id,
    person_id: v7Id,
    name: "Admin User",
    email: "admin@test.com",
    password_hash: "hashed_pass",
    role_id: v7Id,
    is_active: true,
    force_change_password: false,
    job_title: "Administrator",
    department: "IT",
    last_login_at: new Date(),
    created_at: new Date(),
    updated_at: new Date()
  };

  beforeEach(() => {
    userRepository = {
      findByEmail: mock(async () => UserMapper.fromPersistence(mockUserRaw)),
      save: mock(async () => {}),
      countActiveSuperAdmins: mock()
    } as any;

    tokenRepository = {
      saveRefreshToken: mock(async () => {})
    } as any;

    passwordHasher = {
      compare: mock(async (p, h) => p === "StrongP@ss123"), // Senha válida deve ser forte
      hash: mock()
    };

    jwtProvider = {
      sign: mock(async () => "jwt_token"),
      verify: mock()
    };

    eventBus = {
      publish: mock(async () => {}),
      subscribe: mock()
    };

    useCase = new LoginUseCase(userRepository, tokenRepository, passwordHasher, jwtProvider, eventBus);
  });

  test("should login successfully with valid credentials", async () => {
    const result = await useCase.execute({ email: "admin@test.com", password: "StrongP@ss123" });

    expect(result.accessToken).toBe("jwt_token");
    expect(result.refreshToken).toBe("jwt_token");
    expect(userRepository.save).toHaveBeenCalled();
    expect(tokenRepository.saveRefreshToken).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalled();
  });

  test("should throw error if password is too short", async () => {
    // Agora o erro vem do Zod antes de chegar na lógica de compare
    expect(useCase.execute({ email: "admin@test.com", password: "123" })).rejects.toThrow();
  });

  test("should throw error if user is inactive", async () => {
    (userRepository.findByEmail as any).mockImplementation(() => 
      Promise.resolve(UserMapper.fromPersistence({ ...mockUserRaw, is_active: false }))
    );

    expect(useCase.execute({ email: "admin@test.com", password: "valid_pass" })).rejects.toThrow("inactive");
  });
});
