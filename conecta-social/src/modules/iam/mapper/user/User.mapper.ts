import { UserEntity } from "../../domain/user/entity/User.entity"; 
import { User } from "../../domain/user/factories/User.factory"; 
import { UserResponse } from "./User.output";

export const UserMapper = {
  toDomain(raw: any): User {
    const props: UserEntity = {
      id: raw.id,
      personId: raw.person_id, // Mapeamento do Golden Record
      name: raw.name,
      email: raw.email,
      passwordHash: raw.password_hash,
      roleId: raw.role_id,
      permissions: raw.permissions || [],
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
      person_id: user.personId || null, // Persistência do Golden Record
      name: user.name,
      email: user.email,
      password_hash: user.passwordHash,
      role_id: user.roleId,
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
  
  toResponse(user: User): UserResponse {
    return {
      id: user.id!,
      personId: user.personId, // Exposição na API
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      permissions: user.permissions,
      isActive: user.isActive,
      requiresReset: user.requiresReset(),
      jobTitle: user.props.jobTitle,
      department: user.props.department,
      lastLoginAt: user.props.lastLoginAt,
      createdAt: user.props.createdAt,
      updatedAt: user.props.updatedAt
    };
  }
}
