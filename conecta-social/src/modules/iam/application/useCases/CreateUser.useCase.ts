import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { IUserRepository } from "../../domain/user/user.repository";
import { EventBus } from "../../../shared/domain/events/EventBus.protocol";
import { CreateUserDTO } from "../mappers/user/inputs/CreateUser.input";
import { UserMapper } from "../mappers/user/User.mapper";
import { Email } from "../../domain/user/value_objects/Email.vo";
import { PasswordHasher } from "../../../shared/domain/services/PasswordHasher.protocol";
import { UserResponseDTO } from "../mappers/user/outputs/UserResponse.output";

/**
 * CreateUserUseCase - Orquestração de criação de usuário.
 */
export class CreateUserUseCase implements UseCaseProvider<CreateUserDTO, UserResponseDTO> {
  
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly eventBus: EventBus
  ) {}

  async execute(input: CreateUserDTO): Promise<UserResponseDTO> {
    // 1. Regra de Negócio: Unicidade de E-mail
    const email = Email.create(input.email);
    if (await this.userRepository.existsByEmail(email)) throw new Error(`The email '${input.email}' is already in use.`);

    // 2. Transformação Input -> Domínio (Mapper cuida do Hashing e do Evento de Criação)
    const user = await UserMapper.toDomain(input, this.passwordHasher);

    // 3. Persistência do novo estado
    await this.userRepository.save(user);

    // 4. Publicação dos Eventos de Domínio acumulados
    for (const event of user.domainEvents) {
      await this.eventBus.publish(event);
    }
    user.clearEvents();

    // 5. Resposta Limpa para a Interface
    return UserMapper.toResponse(user);
  }
}