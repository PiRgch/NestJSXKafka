import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { EventPublisher } from '../../application/ports/event-publisher.port';
import { DomainEvent } from '../../domain/events/domain-event';
import { OrderCreatedEvent } from '../../domain/events/order-created.event';
import { KAFKA_TOPICS } from '../kafka/kafka.config';
import type { Logger } from '../../application/ports/logger.port';
import { LOGGER_TOKEN } from '../../application/ports/tokens';

@Injectable()
export class KafkaEventPublisherAdapter implements EventPublisher {
  constructor(
    private readonly kafkaClient: ClientKafka,
    @Inject(LOGGER_TOKEN) private readonly logger: Logger
  ) {}

  async publish(event: DomainEvent): Promise<void> {
    try {
      const topic = this.getTopicForEvent(event);
      const message = this.serializeEvent(event);

      this.logger.log(`Publishing event ${event.getEventName()} to topic ${topic}`, 'KafkaEventPublisher');

      await this.kafkaClient.emit(topic, message).toPromise();
    } catch (error) {
      this.logger.error(`Failed to publish event: ${error.message}`, error.stack, 'KafkaEventPublisher');
      throw error;
    }
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    await Promise.all(events.map(event => this.publish(event)));
  }

  private getTopicForEvent(event: DomainEvent): string {
    switch (event.getEventName()) {
      case 'OrderCreated':
        return KAFKA_TOPICS.ORDER_CREATED;
      default:
        return KAFKA_TOPICS.ORDER_EVENTS;
    }
  }

  private serializeEvent(event: DomainEvent): any {
    if (event instanceof OrderCreatedEvent) {
      return {
        eventName: event.getEventName(),
        eventVersion: event.eventVersion,
        occurredOn: event.occurredOn.toISOString(),
        data: {
          orderId: event.orderId.value,
          customerId: event.customerId,
          totalAmount: {
            amount: event.totalAmount.amount,
            currency: event.totalAmount.currency
          },
          items: event.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: {
              amount: item.price.amount,
              currency: item.price.currency
            }
          }))
        }
      };
    }

    return {
      eventName: event.getEventName(),
      eventVersion: event.eventVersion,
      occurredOn: event.occurredOn.toISOString(),
      data: event
    };
  }
}