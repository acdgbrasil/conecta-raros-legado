import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { UserRepository } from "../../domain/user/repository/User.repository";
import { UserMapper } from "../../mapper/user/User.mapper";
import { UserResponse } from "../../mapper/user/User.output";

/**
 * UseCase para obter o perfil do usuário logado.
 */
export class GetUserProfileUseCase implements UseCaseProvider<{ userId: string }, UserResponse> {
  
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: { userId: string }): Promise<UserResponse> {
    const user = await this.userRepository.findById(input.userId);
    
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    return UserMapper.toResponse(user);
  }
}