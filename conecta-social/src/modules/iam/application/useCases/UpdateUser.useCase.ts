import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { IUserRepository } from "../../domain/user/user.repository";
import { UpdateUserDTO } from "../mappers/user/inputs/UpdateUser.input";
import { UserResponseDTO } from "../mappers/user/outputs/UserResponse.output";
import { UserMapper } from "../mappers/user/User.mapper";
import { createUserId } from "../../domain/types/identifiers";
import { Name } from "../../domain/user/value_objects/Name.vo";
import { JobTitle } from "../../domain/user/value_objects/JobTitle.vo";
import { Department } from "../../domain/user/value_objects/Department.vo";
import { EventBus } from "../../../shared/domain/events/EventBus.protocol";

/**
 * UpdateUserUseCase - Atualização cadastral do usuário.
 */
export class UpdateUserUseCase implements UseCaseProvider<UpdateUserDTO, UserResponseDTO> {
  
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(input: UpdateUserDTO): Promise<UserResponseDTO> {
    const userId = createUserId(input.id);
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error("User not found.");
    }

    // 1. Atualiza detalhes via Entidade (Domínio Rico)
    user.updateDetails({
      name: input.name ? Name.create(input.name) : undefined,
      jobTitle: input.jobTitle ? JobTitle.create(input.jobTitle) : undefined,
      department: input.department ? Department.create(input.department) : undefined
    });

    // 2. Persistência
    await this.userRepository.save(user);

    // 3. Publicação de Eventos (UserUpdated)
    for (const event of user.domainEvents) {
      await this.eventBus.publish(event);
    }
    user.clearEvents();

    return UserMapper.toResponse(user);
  }
}
