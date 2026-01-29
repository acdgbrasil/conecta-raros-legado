import { RoleId, PermissionId } from "../types/identifiers";
import { RoleName } from "./value_objects/RoleName.vo";
import { AggregateRoot } from "../../../shared/domain/AggregateRoot";
import { RolePermissionsUpdatedEvent } from "../events/RolePermissionsUpdated.event";

export interface IRole {
  readonly id: RoleId;
  readonly name: RoleName;
  readonly description: string;
  readonly isSystem: boolean;
  readonly permissionIds: ReadonlySet<PermissionId>;
  readonly createdAt: Date;
}

export abstract class RoleAggregate extends AggregateRoot implements IRole {
  constructor(
    public readonly id: RoleId,
    protected _name: RoleName,
    public description: string,
    public readonly isSystem: boolean,
    protected _permissionIds: Set<PermissionId>,
    public readonly createdAt: Date
  ) {
    super();
  }

  get name(): RoleName {
    return this._name;
  }

  get permissionIds(): ReadonlySet<PermissionId> {
    return this._permissionIds;
  }

  // --- Comportamentos ---

  public rename(newName: RoleName): void {
    if (this.isSystem) {
      throw new Error("System roles cannot be renamed.");
    }
    this._name = newName;
  }

  public updatePermissions(newPermissions: Set<PermissionId>): void {
    if (this.isSystem) {
      // Regra de negócio: System Roles são protegidas.
      // Dependendo da regra estrita, podemos bloquear total ou permitir apenas adição.
      // Aqui, seguindo o documento: "nunca pode ter permissões removidas".
      // Vamos simplificar para imutabilidade total por enquanto, ou implementar a lógica de merge depois.
      throw new Error("System roles cannot have permissions modified directly.");
    }
    this._permissionIds = newPermissions;
    this.addDomainEvent(new RolePermissionsUpdatedEvent(this.id, newPermissions));
  }

  public canBeDeleted(): boolean {
    return !this.isSystem;
  }
}
