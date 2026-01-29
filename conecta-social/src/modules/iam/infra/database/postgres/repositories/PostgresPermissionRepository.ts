import { pg } from "@modules/shared/infra/postgres/client/postgres.client";
import { IPermissionRepository } from "@modules/iam/domain/permission/permission.repository";
import { Permission } from "@modules/iam/domain/permission/permission.entity";
import { PermissionId } from "@modules/iam/domain/types/identifiers";
import { PermissionSlug } from "@modules/iam/domain/permission/value_objects/PermissionSlug.vo";
import { PermissionMapper } from "@modules/iam/application/mappers/permission/Permission.mapper";

export class PostgresPermissionRepository implements IPermissionRepository {
  
  async save(permission: Permission): Promise<void> {
    const data = PermissionMapper.toPersistence(permission);

    await pg`
      INSERT INTO permissions (id, slug, description, module)
      VALUES (${data.id}, ${data.slug}, ${data.description}, ${data.module})
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        description = EXCLUDED.description,
        module = EXCLUDED.module
    `;
  }

  async findById(id: PermissionId): Promise<Permission | null> {
    const rows = await pg`SELECT * FROM permissions WHERE id = ${id as string} LIMIT 1`;
    if (rows.length === 0) return null;
    return PermissionMapper.fromPersistence(rows[0]);
  }

  async findBySlug(slug: PermissionSlug): Promise<Permission | null> {
    const rows = await pg`SELECT * FROM permissions WHERE slug = ${slug.value} LIMIT 1`;
    if (rows.length === 0) return null;
    return PermissionMapper.fromPersistence(rows[0]);
  }

  async findAll(): Promise<Permission[]> {
    const rows = await pg`SELECT * FROM permissions ORDER BY module, slug ASC`;
    return rows.map(row => PermissionMapper.fromPersistence(row));
  }

  async findByIds(ids: Set<PermissionId>): Promise<Permission[]> {
    const idArray = Array.from(ids).map(id => id as string);
    if (idArray.length === 0) return [];
    
    const rows = await pg`SELECT * FROM permissions WHERE id IN ${pg(idArray)}`;
    return rows.map(row => PermissionMapper.fromPersistence(row));
  }
}
