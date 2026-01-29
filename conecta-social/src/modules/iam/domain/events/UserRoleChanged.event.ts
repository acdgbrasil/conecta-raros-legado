import { DomainEvent } from "../../../shared/domain/events/EventBus.protocol";
import { UserId, RoleId } from "../types/identifiers";

export class UserRoleChangedEvent implements DomainEvent {
  public readonly eventName = 'UserRoleChanged';
  public readonly occurredOn: Date;
  public readonly payload: {
    userId: string;
    newRoleId: string;
  };

  constructor(userId: UserId, newRoleId: RoleId) {
    this.occurredOn = new Date();
    this.payload = { 
      userId: userId as string,
      newRoleId: newRoleId as string 
    };
  }
}
