import { z } from "zod";
import { RoleAggregate } from "../../../../domain/role/role.entity";
import { createRoleId, createPermissionId } from "../../../../domain/types/identifiers";
import { RoleName } from "../../../../domain/role/value_objects/RoleName.vo";

export const RolePersistenceSchema = z.object({
  id: z.uuidv7(),
  name: z.string(),
  description: z.string(),
  is_system: z.boolean(),
  permission_ids: z.array(z.uuidv7()),
  created_at: z.date()
});

export type RolePersistenceDTO = z.infer<typeof RolePersistenceSchema>;

/**
 * RolePersistenceCodec - Codec bi-direcional (Zod v4.1+)
 */
export const RolePersistenceCodec = z.codec(
  RolePersistenceSchema,
  z.custom<RoleAggregate>(),
  {
    decode: (data) => {
      class ConcreteRole extends RoleAggregate {}
      return new ConcreteRole(
        createRoleId(data.id),
        RoleName.create(data.name),
        data.description,
        data.is_system,
        new Set(data.permission_ids.map(createPermissionId)),
        data.created_at
      );
    },
    encode: (role) => {
      return {
        id: role.id,
        name: role.name.value,
        description: role.description,
        is_system: role.isSystem,
        permission_ids: Array.from(role.permissionIds),
        created_at: role.createdAt
      };
    }
  }
);
