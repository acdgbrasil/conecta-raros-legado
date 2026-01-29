import { UserMapper } from "@modules/iam/application/mappers/user/User.mapper";
import { createUserId, RoleId, UserId } from "@modules/iam/domain/types/identifiers";
import { UserAggregate } from "@modules/iam/domain/user/user.entity";
import { IUserRepository } from "@modules/iam/domain/user/user.repository";
import { Email } from "@modules/iam/domain/user/value_objects/Email.vo";
import { pg } from "@modules/shared/infra/postgres/client/postgres.client";
import { unknown } from "zod";


export class PostgresUserRepository implements IUserRepository {
  
  async save(user: UserAggregate): Promise<void> {
    const data = UserMapper.toPersistence(user);

    await pg`
      INSERT INTO users (
        id, person_id, name, email, password_hash, role_id, 
        is_active, force_change_password, job_title, department, 
        last_login_at, created_at, updated_at
      ) VALUES (
        ${data.id}, ${data.person_id}, ${data.name}, ${data.email}, ${data.password_hash}, ${data.role_id},
        ${data.is_active}, ${data.force_change_password}, ${data.job_title}, ${data.department},
        ${data.last_login_at}, ${data.created_at}, ${data.updated_at}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        role_id = EXCLUDED.role_id,
        is_active = EXCLUDED.is_active,
        force_change_password = EXCLUDED.force_change_password,
        job_title = EXCLUDED.job_title,
        department = EXCLUDED.department,
        last_login_at = EXCLUDED.last_login_at,
        updated_at = EXCLUDED.updated_at
    `;
  }

  async findByEmail(email: Email): Promise<UserAggregate | null> {
    // Mantendo o JOIN para trazer permissões no futuro se a entidade as tiver, 
    // mas garantindo que o retorno seja mapeado pelo Codec.
    const [row] = await pg`
      SELECT u.* 
      FROM users u
      WHERE u.email = ${email.value}
      LIMIT 1
    `;
    if (!row) return null;
    return UserMapper.fromPersistence(row);
  }

  async findById(id: UserId): Promise<UserAggregate | null> {
    const [row] = await pg`
      SELECT u.* 
      FROM users u
      WHERE u.id = ${id as string}
      LIMIT 1
    `;
    if (!row) return null;
    return UserMapper.fromPersistence(row);
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const [row] = await pg`SELECT 1 FROM users WHERE email = ${email.value} LIMIT 1`;
    return !!row;
  }

  async countActiveSuperAdmins(): Promise<number> {
    const [row] = await pg`
      SELECT count(*)::int as count 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'SuperAdmin' AND u.is_active = true
    `;
    return row.count;
  }

  async existsActiveByRole(roleId: RoleId): Promise<boolean> {
    const [row] = await pg`
      SELECT 1 FROM users 
      WHERE role_id = ${roleId as string} AND is_active = true 
      LIMIT 1
    `;
    return !!row;
  }

  async findActiveIdsByRole(roleId: RoleId): Promise<UserId[]> {
    const rows = await pg`
      SELECT id FROM users 
      WHERE role_id = ${roleId as string} AND is_active = true
    `;
    return rows.map((r: any) => createUserId(r.id));
  }

  async findAllPaginated(limit: number, offset: number, search?: string): Promise<{ users: UserAggregate[], total: number }> {
    const searchFilter = search ? pg`WHERE u.name ILIKE ${'%' + search + '%'} OR u.email ILIKE ${'%' + search + '%'}` : pg``;

    const [usersRows, countRows] = await Promise.all([
      pg`SELECT u.* FROM users u ${searchFilter} ORDER BY u.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      pg`SELECT count(*)::int as total FROM users u ${searchFilter}`
    ]);

    return {
      users: usersRows.map((row: unknown) => UserMapper.fromPersistence(row)),
      total: countRows[0].total
    };
  }
}