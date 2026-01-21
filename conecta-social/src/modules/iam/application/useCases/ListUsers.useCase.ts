import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { UserRepository } from "../../domain/user/repository/User.repository";
import { ListUsersInput, UserInput } from "../../mapper/user/User.input";
import { UserMapper } from "../../mapper/user/User.mapper";
import { ListUsersOutput } from "../../mapper/user/User.output";

/**
 * UseCase para listar usuários com paginação.
 * Utilizado principalmente em dashboards administrativos.
 */
export class ListUsersUseCase implements UseCaseProvider<ListUsersInput, ListUsersOutput> {
  
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: ListUsersInput): Promise<ListUsersOutput> {
    const parsed = UserInput.parserList(input);
    const offset = (parsed.page - 1) * parsed.limit;

    const { users, total } = await this.userRepository.findAll(parsed.limit, offset);

    return {
      data: users.map(UserMapper.toResponse),
      meta: {
        page: parsed.page,
        limit: parsed.limit,
        total: total
      }
    };
  }
}