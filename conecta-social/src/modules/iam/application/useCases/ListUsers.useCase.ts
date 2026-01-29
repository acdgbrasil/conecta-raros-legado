import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { IUserRepository } from "../../domain/user/user.repository";
import { ListUsersQueryDTO, UserResponseDTO } from "../mappers/user/User.mapper";
import { UserMapper } from "../mappers/user/User.mapper";

export type PaginatedUsersResponse = {
  data: UserResponseDTO[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
};

/**
 * ListUsersUseCase - Lista usuários com paginação e busca.
 * O Mapper garante que os valores numéricos de page e limit existam e sejam válidos.
 */
export class ListUsersUseCase implements UseCaseProvider<ListUsersQueryDTO, PaginatedUsersResponse> {
  
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(query: ListUsersQueryDTO): Promise<PaginatedUsersResponse> {
    // Cálculo do offset otimizado para o banco
    const offset = (query.page - 1) * query.limit;

    // Busca paginada real via repositório
    const { users, total } = await this.userRepository.findAllPaginated(
      query.limit, 
      offset, 
      query.search
    );

    return {
      data: users.map(UserMapper.toResponse),
      meta: {
        page: query.page,
        limit: query.limit,
        total
      }
    };
  }
}
