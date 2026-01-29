import { DomainEvent } from "../../../shared/domain/events/EventBus.protocol";
import { UserId } from "../types/identifiers";

export class UserUpdatedEvent implements DomainEvent {
  public readonly eventName = 'UserUpdated';
  public readonly occurredOn: Date;
  public readonly payload: {
    userId: string;
  };

  constructor(userId: UserId) {
    this.occurredOn = new Date();
    this.payload = { userId: userId as string };
  }
}
