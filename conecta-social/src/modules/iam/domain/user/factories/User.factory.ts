import z from "zod";
import { UserEntity, UserSchema } from "../entity/User.entity";

export class User {
  private constructor(public readonly props: UserEntity) {}

  static create(entity: UserEntity): User {
    const validatedProps = UserSchema.parse(entity);
    return new User(validatedProps);
  }

  static restore(entity: UserEntity): User {
    return new User(entity);
  }

  public can(requiredPermission: string): boolean {
    const myPerms = this.props.permissions || [];
    
    // 1. Super Admin (Coringa Global)
    if (myPerms.includes('*')) return true;

    // 2. Permissão Exata
    if (myPerms.includes(requiredPermission)) return true;

    // 3. Permissão por Grupo (Wildcard)
    const [resource] = requiredPermission.split(':'); // ex: 'families'
    if (resource && myPerms.includes(`${resource}:*`)) return true;

    return false;
  }

  public requiresReset(): boolean {
    return this.props.forceChangePassword;
  }

  public changeRole(newRoleId: string, newPermissions: string[]): void {
    if (!this.props.isActive) {
      throw new Error("Não é possível alterar cargo de usuário inativo.");
    }
    
    // Valida se o novo ID é um UUID válido
    z.string().uuid().parse(newRoleId);

    this.props.roleId = newRoleId;
    this.props.permissions = newPermissions; // Atualiza permissões em memória
    this.props.updatedAt = new Date();
  }

  public definePassword(newHash: string): void {
    this.props.passwordHash = newHash;
    this.props.forceChangePassword = false;
    this.props.updatedAt = new Date();
  }

  public toggleStatus(): void {
    this.props.isActive = !this.props.isActive;
    this.props.updatedAt = new Date();
  }

  public registerLogin(): void {
    this.props.lastLoginAt = new Date();
  }

  /**
   * Atualiza dados cadastrais permitidos.
   * Campos sensíveis ou de controle (role, senha, status) devem usar métodos específicos.
   */
  public updateDetails(data: Partial<Pick<UserEntity, 'name' | 'cpf' | 'jobTitle' | 'department'>>): void {
    if (data.name) this.props.name = data.name;
    if (data.cpf !== undefined) this.props.cpf = data.cpf;
    if (data.jobTitle !== undefined) this.props.jobTitle = data.jobTitle;
    if (data.department !== undefined) this.props.department = data.department;
    
    this.props.updatedAt = new Date();
  }

  //MARK: Getters
  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get email() { return this.props.email; }
  get roleId() { return this.props.roleId; }
  get permissions() { return this.props.permissions; }
  get isActive() { return this.props.isActive; }
  get passwordHash() { return this.props.passwordHash; }
}
