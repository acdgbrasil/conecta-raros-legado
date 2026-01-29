import { UserAggregate } from "./user.entity";
import { Email } from "./value_objects/Email.vo";
import { UserId, RoleId } from "../types/identifiers";

export interface IUserRepository {
  save(user: UserAggregate): Promise<void>;
  findByEmail(email: Email): Promise<UserAggregate | null>;
  findById(id: UserId): Promise<UserAggregate | null>;
  existsByEmail(email: Email): Promise<boolean>;

  /**
   * Conta quantos usuários ativos possuem a role 'SuperAdmin'.
   * Necessário para a Regra #7 (Last Admin Standing).
   */
  countActiveSuperAdmins(): Promise<number>;

  /**
   * Verifica se existe algum usuário ATIVO vinculado a esta Role.
   * Necessário para a Regra #3 (Role In Use Protection).
   */
  existsActiveByRole(roleId: RoleId): Promise<boolean>;

  /**
   * Busca todos os IDs de usuários ativos vinculados a uma Role.
   * Usado para revogação de tokens em cascata.
   */
  findActiveIdsByRole(roleId: RoleId): Promise<UserId[]>;

  /**
   * Busca paginada com filtro opcional.
   */
  findAllPaginated(limit: number, offset: number, search?: string): Promise<{ users: UserAggregate[], total: number }>;
}
