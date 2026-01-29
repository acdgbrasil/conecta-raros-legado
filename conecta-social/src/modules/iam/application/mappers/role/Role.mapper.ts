import { RoleAggregate, IRole } from "../../../domain/role/role.entity";
import { createRoleId, createPermissionId } from "../../../domain/types/identifiers";
import { RoleName } from "../../../domain/role/value_objects/RoleName.vo";

// Pièces modulares
import { CreateRoleSchema, CreateRoleDTO } from "./inputs/CreateRole.input";
import { UpdateRoleSchema, UpdateRoleDTO } from "./inputs/UpdateRole.input";
import { RoleResponseSchema, RoleResponseDTO } from "./outputs/RoleResponse.output";
import { RolePersistenceCodec, RolePersistenceDTO } from "./persistence/RolePersistence.mapper";

/**
 * RoleMapper - Fachada Principal para Transformações de Cargo.
 */
export class RoleMapper {
  public static readonly Schemas = {
    Input: {
      Create: CreateRoleSchema,
      Update: UpdateRoleSchema
    },
    Output: {
      Default: RoleResponseSchema
    },
    Persistence: {
      Codec: RolePersistenceCodec
    }
  };

  public static toDomain(raw: CreateRoleDTO | unknown): RoleAggregate {
    const data = CreateRoleSchema.parse(raw);

    class ConcreteRole extends RoleAggregate {}

    return new ConcreteRole(
      createRoleId(data.id ?? crypto.randomUUID()),
      RoleName.create(data.name),
      data.description,
      data.isSystem,
      new Set(data.permissionIds.map(createPermissionId)),
      new Date()
    );
  }

  public static toResponse(role: IRole): RoleResponseDTO {
    return {
      id: role.id,
      name: role.name.value,
      description: role.description,
      isSystem: role.isSystem,
      permissionIds: Array.from(role.permissionIds),
      createdAt: role.createdAt.toISOString()
    };
  }

  public static toPersistence(role: RoleAggregate): RolePersistenceDTO {
    return RolePersistenceCodec.encode(role);
  }

  public static fromPersistence(raw: unknown): RoleAggregate {
    return RolePersistenceCodec.decode(raw);
  }

  public static validateUpdate(raw: unknown): UpdateRoleDTO {
    return UpdateRoleSchema.parse(raw);
  }
}