import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { TokenRepository } from "../../domain/authentication/repository/Token.repository";
import { UserRepository } from "../../domain/user/repository/User.repository";
import { ChangeRoleInput, UserInput } from "../../mapper/user/User.input";
import { UserMapper } from "../../mapper/user/User.mapper";
import { UserResponse } from "../../mapper/user/User.output";

/**
 * UseCase responsável pela alteração de cargo (Role) de um usuário.
 * 
 * Este caso de uso realiza as seguintes ações:
 * 1. Verifica se o usuário alvo existe.
 * 2. Valida se o novo cargo existe.
 * 3. Busca as novas permissões associadas ao cargo.
 * 4. Atualiza o cargo e as permissões na entidade Usuário.
 * 5. Persiste as alterações no banco de dados.
 * 6. CRÍTICO: Revoga todos os Refresh Tokens do usuário para forçar o logout e garantir que as novas permissões sejam aplicadas no próximo login.
 */
export class ChangeUserRoleUseCase implements UseCaseProvider<ChangeRoleInput, UserResponse> {
  
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository
  ) {}

  /**
   * Executa a troca de cargo.
   * @param input Dados contendo o ID do usuário e o ID do novo cargo.
   * @returns O objeto do usuário atualizado.
   * @throws Error se o usuário ou o cargo não forem encontrados.
   */
  async execute(input: ChangeRoleInput): Promise<UserResponse> {
    const parsed = UserInput.parserChangeRole(input);

    const user = await this.userRepository.findById(parsed.userId);
    if (!user) throw new Error("Usuário não encontrado.");

    const roleExists = await this.userRepository.checkRoleExists(parsed.newRoleId);
    if (!roleExists) throw new Error("Cargo (Role) inválido ou inexistente.");

    // TODO: REVISAR REGRAS DE NEGÓCIO DE HIERARQUIA
    // Ex: Um Admin pode se rebaixar? Um Operador pode promover alguém para Admin?
    // Atualmente confiamos apenas na permissão da rota, mas regras de domínio podem ser necessárias aqui.

    const newPermissions = await this.userRepository.getPermissionsByRoleId(parsed.newRoleId);

    // O método da entidade já valida se o usuário está ativo
    user.changeRole(parsed.newRoleId, newPermissions);

    await this.userRepository.save(user);

    // Segurança Crítica: Revogar sessões para forçar atualização de permissões
    await this.tokenRepository.revokeAllUserRefreshTokens(user.id!);

    return UserMapper.toResponse(user);
  }
}