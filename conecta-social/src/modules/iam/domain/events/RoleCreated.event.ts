import { DomainEvent } from "../../../shared/domain/events/EventBus.protocol";
import { RoleId } from "../types/identifiers";
import { RoleName } from "../role/value_objects/RoleName.vo";

export class RoleCreatedEvent implements DomainEvent {
  public readonly eventName = 'RoleCreated';
  public readonly occurredOn: Date;
  public readonly payload: {
    roleId: string;
    roleName: string;
  };

  constructor(roleId: RoleId, roleName: RoleName) {
    this.occurredOn = new Date();
    this.payload = { 
      roleId: roleId as string,
      roleName: roleName.value
    };
  }
}
