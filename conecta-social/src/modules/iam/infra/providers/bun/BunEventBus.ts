import { EventBus, DomainEvent, EventHandler } from "../../../../shared/domain/events/EventBus.protocol";

/**
 * BunEventBus - Implementation using native EventTarget.
 * 
 * Bun optimizes EventTarget (Web Standard) to be extremely fast for 
 * in-process messaging, acting as a native Pub/Sub mechanism 
 * without external dependencies.
 */
export class BunEventBus implements EventBus {
  private bus: EventTarget;

  constructor() {
    this.bus = new EventTarget();
  }

  /**
   * Publishes a domain event.
   * Uses CustomEvent to carry the payload across the native bus.
   */
  async publish(event: DomainEvent): Promise<void> {
    const customEvent = new CustomEvent(event.eventName, { 
      detail: event 
    });
    
    // O dispatchEvent no Bun é síncrono por padrão da spec, 
    // mas os handlers podem ser assíncronos.
    this.bus.dispatchEvent(customEvent);
  }

  /**
   * Subscribes a handler to a specific event name.
   */
  subscribe<T extends DomainEvent>(eventName: string, handler: EventHandler<T>): void {
    // Wrapper para converter o Event de volta para DomainEvent
    const wrapper = async (nativeEvent: Event) => {
      const domainEvent = (nativeEvent as CustomEvent).detail as T;
      try {
        await handler.handle(domainEvent);
      } catch (error) {
        console.error(`[BunEventBus] Error handling event ${eventName}:`, error);
      }
    };

    this.bus.addEventListener(eventName, wrapper as any);
  }
}
