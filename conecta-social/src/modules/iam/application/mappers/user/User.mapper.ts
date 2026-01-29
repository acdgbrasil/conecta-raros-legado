import { UserAggregate, IUser } from "../../../domain/user/user.entity";
import { createUserId, createPersonId, createRoleId } from "../../../domain/types/identifiers";
import { Name } from "../../../domain/user/value_objects/Name.vo";
import { Email } from "../../../domain/user/value_objects/Email.vo";
import { JobTitle } from "../../../domain/user/value_objects/JobTitle.vo";
import { Department } from "../../../domain/user/value_objects/Department.vo";
import { PasswordHasher } from "../../../shared/domain/services/PasswordHasher.protocol";
import { UserCreatedEvent } from "../../../domain/events/UserCreated.event";

// Imports modulares
import { CreateUserSchema, CreateUserDTO } from "./inputs/CreateUser.input";
import { UserResponseSchema, UserResponseDTO } from "./outputs/UserResponse.output";
import { UserPersistenceCodec, UserPersistenceDTO } from "./persistence/UserPersistence.mapper";
import { UserCreatedMessageSchema, UserCreatedMessage } from "./messages/UserCreated.message";
import { ListUsersQuerySchema, ListUsersQueryDTO } from "./inputs/ListUsers.input";
import { UpdateUserStatusSchema, UpdateUserStatusDTO } from "./inputs/UpdateUserStatus.input";

export class UserMapper {
  public static readonly Schemas = {
    Input: { Create: CreateUserSchema, List: ListUsersQuerySchema, UpdateStatus: UpdateUserStatusSchema },
    Output: { Default: UserResponseSchema },
    Persistence: { Codec: UserPersistenceCodec },
    Message: { Created: UserCreatedMessageSchema }
  };

  /**
   * Transforma Input em Domínio.
   * Assume a responsabilidade de Hashing e Geração de Senha.
   */
  public static async toDomain(raw: CreateUserDTO | unknown, hasher: PasswordHasher): Promise<UserAggregate> {
    const data = CreateUserSchema.parse(raw);

    const plainPassword = data.password || this.generateStrongPassword();
    const passwordHash = await hasher.hash(plainPassword);

    class ConcreteUser extends UserAggregate {}

    const user = new ConcreteUser(
      createUserId(data.id ?? crypto.randomUUID()),
      createPersonId(data.personId),
      Name.create(data.name),
      Email.create(data.email),
      passwordHash,
      createRoleId(data.roleId),
      data.isActive,
      data.forceChangePassword,
      new Date(),
      new Date()
    );

    user['addDomainEvent'](new UserCreatedEvent(
      user.id, 
      user.personId, 
      user.email, 
      user.name, 
      plainPassword
    ));

    return user;
  }

  public static toResponse(user: IUser): UserResponseDTO {
    return {
      id: user.id,
      personId: user.personId,
      name: user.name.value,
      email: user.email.value,
      roleId: user.roleId,
      isActive: user.isActive,
      jobTitle: user.jobTitle?.value,
      department: user.department?.value,
      lastLoginAt: user.lastLoginAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  }

  public static toPersistence(user: UserAggregate): UserPersistenceDTO {
    return UserPersistenceCodec.encode(user);
  }

  public static fromPersistence(raw: unknown): UserAggregate {
    return UserPersistenceCodec.decode(raw);
  }

  private static generateStrongPassword(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password + "Aa1!"; 
  }

  public static validateListQuery(raw: unknown): ListUsersQueryDTO { return ListUsersQuerySchema.parse(raw); }
  public static validateUpdateStatus(raw: unknown): UpdateUserStatusDTO { return UpdateUserStatusSchema.parse(raw); }
}
