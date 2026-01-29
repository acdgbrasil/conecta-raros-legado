import { pg } from "@modules/shared/infra/postgres/client/postgres.client";
import { IRoleRepository } from "@modules/iam/domain/role/role.repository";
import { RoleAggregate } from "@modules/iam/domain/role/role.entity";
import { RoleId } from "@modules/iam/domain/types/identifiers";
import { RoleName } from "@modules/iam/domain/role/value_objects/RoleName.vo";
import { RoleMapper } from "@modules/iam/application/mappers/role/Role.mapper";

export class PostgresRoleRepository implements IRoleRepository {
  
  async save(role: RoleAggregate): Promise<void> {
    const data = RoleMapper.toPersistence(role);

    // O Especialista de Ops recomenda Transação para tabelas vinculadas
    await pg.begin(async (sql) => {
      // 1. Salva a Role
      await sql`
        INSERT INTO roles (id, name, description, is_system, created_at)
        VALUES (${data.id}, ${data.name}, ${data.description}, ${data.is_system}, ${data.created_at})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          is_system = EXCLUDED.is_system
      `;

      // 2. Sincroniza Permissões (Delete All + Insert New para simplicidade e atomicidade)
      await sql`DELETE FROM role_permissions WHERE role_id = ${data.id}`;
      
      if (data.permission_ids.length > 0) {
        const values = data.permission_ids.map(permId => ({
          role_id: data.id,
          permission_id: permId
        }));
        await sql`INSERT INTO role_permissions ${sql(values)}`;
      }
    });
  }

  async findById(id: RoleId): Promise<RoleAggregate | null> {
    const rows = await pg`
      SELECT r.*, array_agg(rp.permission_id) FILTER (WHERE rp.permission_id IS NOT NULL) as permission_ids
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      WHERE r.id = ${id as string}
      GROUP BY r.id
      LIMIT 1
    `;
    if (rows.length === 0) return null;
    
    // Converte permission_ids de null para array vazio se necessário
    const raw = { ...rows[0], permission_ids: rows[0].permission_ids || [] };
    return RoleMapper.fromPersistence(raw);
  }

  async findByName(name: RoleName): Promise<RoleAggregate | null> {
    const rows = await pg`
      SELECT r.*, array_agg(rp.permission_id) FILTER (WHERE rp.permission_id IS NOT NULL) as permission_ids
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      WHERE r.name = ${name.value}
      GROUP BY r.id
      LIMIT 1
    `;
    if (rows.length === 0) return null;
    const raw = { ...rows[0], permission_ids: rows[0].permission_ids || [] };
    return RoleMapper.fromPersistence(raw);
  }

  async findAll(): Promise<RoleAggregate[]> {
    const rows = await pg`
      SELECT r.*, array_agg(rp.permission_id) FILTER (WHERE rp.permission_id IS NOT NULL) as permission_ids
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      GROUP BY r.id
      ORDER BY r.name ASC
    `;
    return rows.map(row => {
      const raw = { ...row, permission_ids: row.permission_ids || [] };
      return RoleMapper.fromPersistence(raw);
    });
  }

  async existsByName(name: RoleName): Promise<boolean> {
    const rows = await pg`SELECT 1 FROM roles WHERE name = ${name.value} LIMIT 1`;
    return rows.length > 0;
  }

  async delete(id: RoleId): Promise<void> {
    // ON DELETE CASCADE no banco cuida da role_permissions
    await pg`DELETE FROM roles WHERE id = ${id as string}`;
  }
}
