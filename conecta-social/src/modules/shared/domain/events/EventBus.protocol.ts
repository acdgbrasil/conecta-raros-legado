export interface DomainEvent {
  eventName: string;
  occurredOn: Date;
  payload: any;
}

export interface EventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe<T extends DomainEvent>(eventName: string, handler: EventHandler<T>): void;
}
