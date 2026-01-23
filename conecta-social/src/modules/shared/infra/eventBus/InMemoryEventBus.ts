import { DomainEvent, EventBus, EventHandler } from "../../domain/events/EventBus.protocol";

export class InMemoryEventBus implements EventBus {
  private handlers: Map<string, EventHandler<any>[]> = new Map();

  subscribe<T extends DomainEvent>(eventName: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)?.push(handler);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventName) || [];
    
    // Executa todos os handlers.
    // Em produção, isso poderia ser jogado para uma fila (RabbitMQ/Kafka)
    // Para in-memory, usamos Promise.all para paralelismo ou loop simples.
    const promises = handlers.map(handler => {
      try {
        return handler.handle(event);
      } catch (error) {
        console.error(`Erro ao processar evento ${event.eventName}:`, error);
        return Promise.resolve();
      }
    });

    await Promise.all(promises);
  }
}

// Singleton para facilitar o uso global na aplicação sem injeção complexa agora
export const globalEventBus = new InMemoryEventBus();
