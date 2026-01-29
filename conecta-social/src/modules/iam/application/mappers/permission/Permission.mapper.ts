import { Permission, IPermission } from "../../../domain/permission/permission.entity";
import { createPermissionId } from "../../../domain/types/identifiers";
import { PermissionSlug } from "../../../domain/permission/value_objects/PermissionSlug.vo";
import { SystemPermissions } from "../../../domain/permission/SystemPermissions";

// Pièces modulares
import { CreatePermissionSchema, CreatePermissionDTO } from "./inputs/CreatePermission.input";
import { PermissionResponseSchema, PermissionResponseDTO } from "./outputs/PermissionResponse.output";
import { PermissionPersistenceCodec, PermissionPersistenceDTO } from "./persistence/PermissionPersistence.mapper";

/**
 * PermissionMapper - Fachada Principal para Transformações de Permissão.
 */
export class PermissionMapper {
  /**
   * Catálogo de Permissões do Sistema (ACL).
   * Atua como Proxy para a definição pura do Domínio, protegendo a integridade
   * das capacidades do software perante as camadas externas.
   */
  public static readonly IAM_PERMISSIONS = SystemPermissions;

  public static readonly Schemas = {
    Input: {
      Create: CreatePermissionSchema,
    },
    Output: {
      Default: PermissionResponseSchema
    },
    Persistence: {
      Codec: PermissionPersistenceCodec
    }
  };

  public static toDomain(raw: CreatePermissionDTO | unknown): Permission {
    const data = CreatePermissionSchema.parse(raw);

    return new Permission(
      createPermissionId(data.id ?? crypto.randomUUID()),
      PermissionSlug.create(data.slug),
      data.description,
      data.module
    );
  }

  public static toResponse(permission: IPermission): PermissionResponseDTO {
    return {
      id: permission.id,
      slug: permission.slug.value,
      description: permission.description,
      module: permission.module
    };
  }

  public static toPersistence(permission: Permission): PermissionPersistenceDTO {
    return PermissionPersistenceCodec.encode(permission);
  }

  public static fromPersistence(raw: unknown): Permission {
    return PermissionPersistenceCodec.decode(raw);
  }
}