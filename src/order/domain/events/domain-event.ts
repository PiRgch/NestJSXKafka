export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventVersion: number;

  constructor(eventVersion: number = 1) {
    this.occurredOn = new Date();
    this.eventVersion = eventVersion;
  }

  abstract getEventName(): string;
}

export interface DomainEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}
