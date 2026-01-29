import { DomainEvent } from "../../../shared/domain/events/EventBus.protocol";
import { RoleId, PermissionId } from "../types/identifiers";

export class RolePermissionsUpdatedEvent implements DomainEvent {
  public readonly eventName = 'RolePermissionsUpdated';
  public readonly occurredOn: Date;
  public readonly payload: {
    roleId: string;
    permissionIds: string[];
  };

  constructor(roleId: RoleId, permissionIds: Set<PermissionId>) {
    this.occurredOn = new Date();
    this.payload = { 
      roleId: roleId as string,
      permissionIds: Array.from(permissionIds).map(id => id as string)
    };
  }
}
