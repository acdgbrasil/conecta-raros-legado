import { DomainEvent } from "../../../../shared/domain/events/EventBus.protocol";

export class PasswordRecoveryRequestedEvent implements DomainEvent {
  public readonly eventName = 'PasswordRecoveryRequested';
  public readonly occurredOn: Date;
  public readonly payload: {
    email: string;
    code: string;
  };

  constructor(email: string, code: string) {
    this.occurredOn = new Date();
    this.payload = { email, code };
  }
}
