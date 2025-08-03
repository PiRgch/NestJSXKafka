import { Injectable, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { KAFKA_TOPICS } from './kafka.config';
import type { Logger } from '../../application/ports/logger.port';
import { LOGGER_TOKEN } from '../../application/ports/tokens';

@Injectable()
export class KafkaEventHandler {
  constructor(@Inject(LOGGER_TOKEN) private readonly logger: Logger) {}

  @EventPattern(KAFKA_TOPICS.ORDER_CREATED)
  async handleOrderCreated(
    @Payload() message: { data: unknown; [key: string]: unknown },
  ): Promise<void> {
    try {
      this.logger.log(
        `Received OrderCreated event: ${JSON.stringify(message)}`,
        'KafkaEventHandler',
      );

      // Ici vous pouvez ajouter la logique pour traiter l'événement
      // Par exemple, envoyer un email de confirmation, mettre à jour un stock, etc.

      // Exemple de traitement
      await this.processOrderCreatedEvent(
        message as {
          data?: { customerId?: string; [key: string]: unknown };
          [key: string]: unknown;
        },
      );
    } catch (error) {
      this.logger.error(
        `Error handling OrderCreated event: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'KafkaEventHandler',
      );
      throw error;
    }
  }

  @EventPattern(KAFKA_TOPICS.ORDER_EVENTS)
  async handleOrderEvent(
    @Payload() message: { eventName?: string; [key: string]: unknown },
  ): Promise<void> {
    try {
      this.logger.log(
        `Received order event: ${message.eventName ?? 'unknown'}`,
        'KafkaEventHandler',
      );

      switch (message.eventName) {
        case 'OrderCreated':
          await this.processOrderCreatedEvent(
            message as {
              data?: { customerId?: string; [key: string]: unknown };
              [key: string]: unknown;
            },
          );
          break;
        default:
          this.logger.warn(
            `Unknown event type: ${message.eventName ?? 'unknown'}`,
            'KafkaEventHandler',
          );
      }
    } catch (error) {
      this.logger.error(
        `Error handling order event: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
        'KafkaEventHandler',
      );
      throw error;
    }
  }

  private async processOrderCreatedEvent(message: {
    data?: { customerId?: string; [key: string]: unknown };
    [key: string]: unknown;
  }): Promise<void> {
    // Logique métier pour traiter la création de commande
    this.logger.log(
      `Processing order created for customer: ${message.data?.customerId ?? 'unknown'}`,
      'KafkaEventHandler',
    );

    // Exemples d'actions possibles :
    // - Envoyer une notification au client
    // - Décrémer le stock des produits
    // - Créer une facture
    // - Déclencher le processus de préparation

    // Simulation d'un traitement asynchrone
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.logger.log(
      `Order creation processed successfully`,
      'KafkaEventHandler',
    );
  }
}
