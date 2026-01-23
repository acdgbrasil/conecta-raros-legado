import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { UserRepository } from "../../domain/user/repository/User.repository";
import { UpdateUserInput, UserInput } from "../../mapper/user/User.input";
import { UserMapper } from "../../mapper/user/User.mapper";
import { UserResponse } from "../../mapper/user/User.output";

/**
 * UseCase para atualização cadastral do usuário (Nome, CPF, etc).
 */
export class UpdateUserUseCase implements UseCaseProvider<UpdateUserInput, UserResponse> {
  
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: UpdateUserInput): Promise<UserResponse> {
    const parsed = UserInput.parserUpdate(input);

    const user = await this.userRepository.findById(parsed.id);
    if (!user) throw new Error("Usuário não encontrado.");

    // Atualiza apenas campos permitidos
    user.updateDetails({
      name: parsed.name,
      cpf: parsed.cpf,
      jobTitle: parsed.jobTitle,
      department: parsed.department
    });

    await this.userRepository.save(user);

    return UserMapper.toResponse(user);
  }
}