import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { IUserRepository } from "../../domain/user/user.repository";
import { UserResponseDTO } from "../mappers/user/outputs/UserResponse.output";
import { UserMapper } from "../mappers/user/User.mapper";
import { createUserId } from "../../domain/types/identifiers";

/**
 * GetUserProfileUseCase - Retorna os dados resumidos do perfil logado.
 */
export class GetUserProfileUseCase implements UseCaseProvider<{ userId: string }, UserResponseDTO> {
  
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: { userId: string }): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(createUserId(input.userId));
    
    if (!user) {
      throw new Error("User not found.");
    }

    return UserMapper.toResponse(user);
  }
}
