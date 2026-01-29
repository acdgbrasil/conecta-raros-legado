import { DomainEvent } from "../../../shared/domain/events/EventBus.protocol";
import { UserId } from "../types/identifiers";

export class UserPasswordChangedEvent implements DomainEvent {
  public readonly eventName = 'UserPasswordChanged';
  public readonly occurredOn: Date;
  public readonly payload: {
    userId: string;
  };

  constructor(userId: UserId) {
    this.occurredOn = new Date();
    this.payload = { userId: userId as string };
  }
}
