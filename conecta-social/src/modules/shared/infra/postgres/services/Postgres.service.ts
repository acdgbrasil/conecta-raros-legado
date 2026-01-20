import { UserEntity } from "../../../../iam/domain/entity/User.entity";
import { User } from "../../../../iam/domain/factorys/User.factory";
import { UserRepository } from "../../../../iam/domain/repository/User.repository";
import { UserMapper } from "../../../../iam/mapper/user/User.mapper";
import { pg } from "../client/postgres.client";

export class UserPostgresRepository implements UserRepository {
  

  async save(user: User): Promise<void> {
    const p = user.props;
    if (p.id) {
      await pg`
        UPDATE users SET
          name = ${p.name},
          role_id = ${p.roleId},
          cpf = ${p.cpf || null},
          job_title = ${p.jobTitle || null},
          department = ${p.department || null},
          password_hash = ${p.passwordHash || null},
          force_change_password = ${p.forceChangePassword},
          is_active = ${p.isActive},
          last_login_at = ${p.lastLoginAt?.toISOString() || null},
          updated_at = NOW()
        WHERE id = ${p.id}
      `;
    } else {
      await pg`
        INSERT INTO users (
          name, email, role_id, created_by, 
          cpf, job_title, department,
          password_hash, force_change_password, is_active
        ) VALUES (
          ${p.name}, ${p.email}, ${p.roleId}, ${p.createdBy || null},
          ${p.cpf || null}, ${p.jobTitle || null}, ${p.department || null},
          ${p.passwordHash || ''}, ${p.forceChangePassword}, ${p.isActive}
        )
      `;
    }

  }

  async findByEmail(email: string): Promise<User | null> {
    const [row] = await pg`
      SELECT 
        u.*,
        -- Agrega as slugs de permissão em um array JSON
        COALESCE(
          json_agg(p.slug) FILTER (WHERE p.slug IS NOT NULL), 
          '[]'
        ) as permissions
      FROM users u
      LEFT JOIN role_permissions rp ON rp.role_id = u.role_id
      LEFT JOIN permissions p ON p.id = rp.permission_id
      WHERE u.email = ${email}
      GROUP BY u.id
      LIMIT 1
    `;

    if (!row) return null;
    return UserMapper.toDomain(row);
  }
  async findById(id: string): Promise<User | null> {
    const [row] = await pg`
      SELECT 
        u.*,
        COALESCE(
          json_agg(p.slug) FILTER (WHERE p.slug IS NOT NULL), 
          '[]'
        ) as permissions
      FROM users u
      LEFT JOIN role_permissions rp ON rp.role_id = u.role_id
      LEFT JOIN permissions p ON p.id = rp.permission_id
      WHERE u.id = ${id}
      GROUP BY u.id
      LIMIT 1
    `;

    if (!row) return null;
    return UserMapper.toDomain(row);
  }
  async findAll(): Promise<User[]> {
    const rows = await pg`
      SELECT 
        u.id, u.name, u.email, u.role_id, u.is_active, u.job_title,
        r.name as role_name -- Útil para exibir no front (embora não esteja na entidade User pura)
      FROM users u
      JOIN roles r ON r.id = u.role_id
      ORDER BY u.name ASC
    `;

    return rows.map((row: any) => UserMapper.toDomain(row));
  }
  async getPermissionsByRoleId(roleId: string): Promise<string[]> {
    const rows = await pg`
      SELECT p.slug 
      FROM permissions p
      JOIN role_permissions rp ON rp.permission_id = p.id
      WHERE rp.role_id = ${roleId}
    `;
    return rows.map((r: any) => r.slug);
  }
  async checkRoleExists(roleId: string): Promise<boolean> {
    const [row] = await pg`SELECT 1 FROM roles WHERE id = ${roleId}`;
    return !!row;
  }
  
}