import { Injectable, Inject } from '@nestjs/common';
import type { EventPublisher } from '../../application/ports/event-publisher.port';
import type { DomainEvent } from '../../domain/events/domain-event';
import type { Logger } from '../../application/ports/logger.port';
import { LOGGER_TOKEN } from '../../application/ports/tokens';

@Injectable()
export class ConsoleEventPublisherAdapter implements EventPublisher {
  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: Logger
  ) {}

  async publish(event: DomainEvent): Promise<void> {
    this.logger.log(`🚀 Event Published: ${event.getEventName()}`, 'ConsoleEventPublisher');
    console.log('📨 Event Details:', {
      eventName: event.getEventName(),
      eventVersion: event.eventVersion,
      occurredOn: event.occurredOn,
      data: event
    });
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    this.logger.log(`🚀 Publishing ${events.length} events`, 'ConsoleEventPublisher');
    await Promise.all(events.map(event => this.publish(event)));
  }
}