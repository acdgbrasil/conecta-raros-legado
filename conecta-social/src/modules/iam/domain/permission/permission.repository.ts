import { Permission } from "./permission.entity";
import { PermissionId } from "../types/identifiers";
import { PermissionSlug } from "./value_objects/PermissionSlug.vo";

export interface IPermissionRepository {
  save(permission: Permission): Promise<void>;
  findById(id: PermissionId): Promise<Permission | null>;
  findBySlug(slug: PermissionSlug): Promise<Permission | null>;
  findAll(): Promise<Permission[]>;
  findByIds(ids: Set<PermissionId>): Promise<Permission[]>;
}
