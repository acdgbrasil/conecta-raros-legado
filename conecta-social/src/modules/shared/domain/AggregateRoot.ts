import { DomainEvent } from "./events/EventBus.protocol";

export abstract class AggregateRoot {
  private _domainEvents: DomainEvent[] = [];

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public get domainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents;
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }
}
