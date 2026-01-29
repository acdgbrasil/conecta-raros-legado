import { describe, test, expect, mock, beforeEach } from "bun:test";
import { CreateUserUseCase } from "../../useCases/CreateUser.useCase";
import { IUserRepository } from "../../../domain/user/user.repository";
import { PasswordHasher } from "../../../../shared/domain/services/PasswordHasher.protocol";
import { EventBus } from "../../../../shared/domain/events/EventBus.protocol";
import { CreateUserDTO } from "../../mappers/user/inputs/CreateUser.input";

describe("CreateUserUseCase", () => {
  let userRepository: IUserRepository;
  let passwordHasher: PasswordHasher;
  let eventBus: EventBus;
  let useCase: CreateUserUseCase;

  const v7Id = "018e9c34-2e0b-70c8-8000-123456789000";
  const validDTO: CreateUserDTO = {
    personId: v7Id,
    name: "New User",
    email: "newuser@test.com",
    password: "StrongPassword1!",
    roleId: v7Id
  };

  beforeEach(() => {
    userRepository = {
      existsByEmail: mock(async () => false),
      save: mock(async () => {}),
      findById: mock(),
      findByEmail: mock(),
      countActiveSuperAdmins: mock(),
      existsActiveByRole: mock(),
      findActiveIdsByRole: mock(),
      findAllPaginated: mock()
    } as any;

    passwordHasher = {
      hash: mock(async (p) => `hashed_${p}`),
      compare: mock()
    };

    eventBus = {
      publish: mock(async () => {}),
      subscribe: mock()
    };

    useCase = new CreateUserUseCase(userRepository, passwordHasher, eventBus);
  });

  test("should create a user successfully and publish event", async () => {
    const result = await useCase.execute(validDTO);

    expect(result.email).toBe(validDTO.email);
    expect(userRepository.existsByEmail).toHaveBeenCalled();
    expect(userRepository.save).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalled();
    
    // Verifica se o evento UserCreated foi publicado
    const publishedEvent = (eventBus.publish as any).mock.calls[0][0];
    expect(publishedEvent.eventName).toBe("UserCreated");
    expect(publishedEvent.payload.email).toBe(validDTO.email);
  });

  test("should throw error if email already exists", async () => {
    (userRepository.existsByEmail as any).mockImplementation(() => Promise.resolve(true));

    expect(useCase.execute(validDTO)).rejects.toThrow("already in use");
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
