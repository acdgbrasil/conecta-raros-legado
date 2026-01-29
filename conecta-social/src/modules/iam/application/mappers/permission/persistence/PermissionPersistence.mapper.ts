import { z } from "zod";
import { Permission } from "../../../../domain/permission/permission.entity";
import { createPermissionId } from "../../../../domain/types/identifiers";
import { PermissionSlug } from "../../../../domain/permission/value_objects/PermissionSlug.vo";

export const PermissionPersistenceSchema = z.object({
  id: z.uuidv7(),
  slug: z.string(),
  description: z.string(),
  module: z.string()
});

export type PermissionPersistenceDTO = z.infer<typeof PermissionPersistenceSchema>;

/**
 * PermissionPersistenceCodec - Codec bi-direcional (Zod v4.1+)
 */
export const PermissionPersistenceCodec = z.codec(
  PermissionPersistenceSchema,
  z.custom<Permission>(),
  {
    decode: (data) => {
      return new Permission(
        createPermissionId(data.id),
        PermissionSlug.create(data.slug),
        data.description,
        data.module
      );
    },
    encode: (domain) => {
      return {
        id: domain.id,
        slug: domain.slug.value,
        description: domain.description,
        module: domain.module
      };
    }
  }
);
