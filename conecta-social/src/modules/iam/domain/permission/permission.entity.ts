import { PermissionId } from "../types/identifiers";
import { PermissionSlug } from "./value_objects/PermissionSlug.vo";

export interface IPermission {
  readonly id: PermissionId;
  readonly slug: PermissionSlug;
  readonly description: string;
  readonly module: string;
}

export class Permission implements IPermission {
  constructor(
    public readonly id: PermissionId,
    public readonly slug: PermissionSlug,
    public readonly description: string,
    public readonly module: string
  ) {}
}
