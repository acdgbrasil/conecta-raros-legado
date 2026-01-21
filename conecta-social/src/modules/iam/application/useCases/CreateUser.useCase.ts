import { EventBus } from "../../../shared/domain/events/EventBus.protocol";
import { UserGenerates } from "../../../shared/infra/services/generated/User.generate";
import { UseCaseProvider } from "../../../shared/providers/useCase/UseCase.provider";
import { UserEntity } from "../../domain/user/entity/User.entity";
import { CreatedUserEvent } from "../../domain/user/events/CreateNewUser.event";
import { User } from "../../domain/user/factories/User.factory";
import { UserRepository } from "../../domain/user/repository/User.repository";
import { CreateUserInput, UserInput } from "../../mapper/user/User.input";
import { UserMapper } from "../../mapper/user/User.mapper";
import { UserResponse } from "../../mapper/user/User.output";

/**
 * UseCase responsável por criar novos usuários no sistema.
 * Geralmente invocado por administradores.
 */
export class CreateUserUseCase implements UseCaseProvider<CreateUserInput,UserResponse> {
  
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus
  ){}

  /**
   * Cria um novo usuário.
   * 
   * Fluxo:
   * 1. Valida input.
   * 2. Verifica unicidade de email.
   * 3. Verifica existência do cargo.
   * 4. Gera senha aleatória forte (se não fornecida).
   * 5. Hash da senha.
   * 6. Cria entidade User com permissões carregadas.
   * 7. Salva no banco.
   * 8. Publica evento `CreatedUserEvent` (para envio de email de boas-vindas).
   * 
   * @param input Dados do novo usuário (nome, email, cargo, etc).
   * @returns Dados do usuário criado (sem a senha).
   */
  async execute(input: CreateUserInput): Promise<UserResponse> {
    const createUserParsedInput = UserInput.parserCreate(input);
    const emailAlreadyExists = await this.userRepository.findByEmail(createUserParsedInput.email);
    if (emailAlreadyExists) throw new Error('Email already in use');
    const roleExists = await this.userRepository.checkRoleExists(createUserParsedInput.roleId);
    if (!roleExists) throw new Error('Role does not exist');
    const getPermissions = await this.userRepository.getPermissionsByRoleId(createUserParsedInput.roleId);
    const finalPassword = createUserParsedInput.password || UserGenerates.randomPassword();
    const passwordToHash = await Bun.password.hash(finalPassword);

    const userEntity: UserEntity = {
      name: createUserParsedInput.name,
      email: createUserParsedInput.email,
      roleId: createUserParsedInput.roleId,
      permissions: getPermissions,
      cpf: createUserParsedInput.cpf,
      jobTitle: createUserParsedInput.jobTitle,
      department: createUserParsedInput.department,
      createdBy: createUserParsedInput.createdBy,
      isActive: createUserParsedInput.isActive,
      forceChangePassword: createUserParsedInput.forceChangePassword,
      passwordHash: passwordToHash,
    }

    const newUser = User.create(userEntity);
    await this.userRepository.save(newUser);
    await this.eventBus.publish(new CreatedUserEvent(
      newUser.id!,
      newUser.email,
      newUser.name,
      finalPassword
    ));
    
    return UserMapper.toResponse(newUser);
  }
}