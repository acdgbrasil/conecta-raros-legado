import { describe, expect, test, spyOn } from "bun:test";
import { BunEventBus } from "../BunEventBus";
import { DomainEvent, EventHandler } from "../../../../shared/domain/events/EventBus.protocol";

describe("BunEventBus", () => {
  test("should publish and subscribe to events", async () => {
    const bus = new BunEventBus();
    const eventName = "test.event";
    const payload = { data: "hello" };
    
    const event: DomainEvent = {
      eventName,
      occurredOn: new Date(),
      payload
    };

    let receivedEvent: DomainEvent | null = null;
    const handler: EventHandler<DomainEvent> = {
      handle: async (e) => {
        receivedEvent = e;
      }
    };

    bus.subscribe(eventName, handler);
    await bus.publish(event);

    // Pequeno delay para garantir processamento se fosse async, 
    // embora EventTarget seja sync no dispatch.
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(receivedEvent).not.toBeNull();
    expect(receivedEvent?.eventName).toBe(eventName);
    expect(receivedEvent?.payload).toEqual(payload);
  });

  test("should handle multiple subscribers", async () => {
    const bus = new BunEventBus();
    let count = 0;
    
    const handler: EventHandler<any> = {
      handle: async () => { count++; }
    };

    bus.subscribe("inc", handler);
    bus.subscribe("inc", handler); // Mesma função mas registrada duas vezes

    await bus.publish({ eventName: "inc", occurredOn: new Date(), payload: {} });
    
    expect(count).toBe(2);
  });
});
