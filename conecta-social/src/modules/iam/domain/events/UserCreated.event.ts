import { DomainEvent } from "../../../shared/domain/events/EventBus.protocol";
import { UserId, PersonId } from "../types/identifiers";
import { Email } from "../user/value_objects/Email.vo";
import { Name } from "../user/value_objects/Name.vo";

export class UserCreatedEvent implements DomainEvent {
  public readonly eventName = 'UserCreated';
  public readonly occurredOn: Date;
  public readonly payload: {
    userId: string;
    personId: string;
    email: string;
    name: string;
    plainPassword: string; // Adicionado para envio de e-mail de boas-vindas
  };

  constructor(userId: UserId, personId: PersonId, email: Email, name: Name, plainPassword: string) {
    this.occurredOn = new Date();
    this.payload = {
      userId: userId as string,
      personId: personId as string,
      email: email.value,
      name: name.value,
      plainPassword
    };
  }
}