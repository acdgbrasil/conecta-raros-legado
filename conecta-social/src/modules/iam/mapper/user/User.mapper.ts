import { UserEntity } from "../../domain/entity/User.entity";
import { User } from "../../domain/factorys/User.factory";

export const UserMapper = {
  toDomain(raw: any): User {
    const props: UserEntity = {
      id: raw.id,
      name: raw.name,
      email: raw.email,
      passwordHash: raw.password_hash,
      roleId: raw.role_id,
      permissions: raw.permissions || [],
      cpf: raw.cpf,
      jobTitle: raw.job_title,
      department: raw.department,
      forceChangePassword: raw.force_change_password,
      isActive: raw.is_active,
      createdBy: raw.created_by,
      lastLoginAt: raw.last_login_at ? new Date(raw.last_login_at) : undefined,
      createdAt: raw.created_at ? new Date(raw.created_at) : undefined,
      updatedAt: raw.updated_at ? new Date(raw.updated_at) : undefined,
    };
    return User.restore(props);
  },
  toPersistence(user: User): any {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password_hash: user.passwordHash,
      role_id: user.roleId,
      cpf: user.props.cpf || null,
      job_title: user.props.jobTitle || null,
      department: user.props.department || null,
      force_change_password: user.props.forceChangePassword,
      is_active: user.props.isActive,
      created_by: user.props.createdBy || null,
      last_login_at: user.props.lastLoginAt ? user.props.lastLoginAt.toISOString() : null,
      created_at: user.props.createdAt ? user.props.createdAt.toISOString() : null,
      updated_at: user.props.updatedAt ? user.props.updatedAt.toISOString() : null,
    };
  },
  toResponse(user: User): any {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      permissions: user.permissions,
      isActive: user.isActive,
      requiresReset: user.requiresReset(),
      jobTitle: user.props.jobTitle,
      department: user.props.department,
      lastLoginAt: user.props.lastLoginAt,
    };
  }
}