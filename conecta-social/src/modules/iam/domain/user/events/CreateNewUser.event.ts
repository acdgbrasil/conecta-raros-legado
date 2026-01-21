import { DomainEvent } from "../../../../shared/domain/events/EventBus.protocol";

export class CreatedUserEvent implements DomainEvent {
  public readonly eventName = 'CreatedUser';
  public readonly occurredOn: Date;
  public readonly payload: {
    userId: string,
    email: string,
    name: string,
    plainPassword: string
  }

  constructor(userId: string, email: string, name: string, plainPassword: string) {
    this.occurredOn = new Date();
    this.payload = { userId, email, name, plainPassword };
  }
}