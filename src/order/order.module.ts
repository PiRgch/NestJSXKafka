import { Module } from '@nestjs/common';
import { ClientsModule, ClientKafka } from '@nestjs/microservices';

// Controllers
import { OrderController } from './interfaces/controllers/order.controller';

// Use Cases
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { GetOrderUseCase } from './application/use-cases/get-order.use-case';

// Ports
import type { Logger } from './application/ports/logger.port';
import {
  ORDER_REPOSITORY_TOKEN,
  EVENT_PUBLISHER_TOKEN,
  LOGGER_TOKEN,
} from './application/ports/tokens';

// Adapters
import { InMemoryOrderRepositoryAdapter } from './infrastructure/adapters/in-memory-order-repository.adapter';
import { KafkaEventPublisherAdapter } from './infrastructure/adapters/kafka-event-publisher.adapter';
import { NestJSLoggerAdapter } from './infrastructure/adapters/nestjs-logger.adapter';

// Kafka
import { KafkaEventHandler } from './infrastructure/kafka/kafka-event-handler';
import { kafkaConfig } from './infrastructure/kafka/kafka.config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        ...kafkaConfig,
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [
    // Use Cases
    CreateOrderUseCase,
    GetOrderUseCase,

    // Adapters (Infrastructure)
    {
      provide: ORDER_REPOSITORY_TOKEN,
      useClass: InMemoryOrderRepositoryAdapter,
    },
    {
      provide: EVENT_PUBLISHER_TOKEN,
      useFactory: (kafkaClient: ClientKafka, logger: Logger) => {
        return new KafkaEventPublisherAdapter(kafkaClient, logger);
      },
      inject: ['KAFKA_SERVICE', LOGGER_TOKEN],
    },
    {
      provide: LOGGER_TOKEN,
      useClass: NestJSLoggerAdapter,
    },

    // Kafka Event Handler
    KafkaEventHandler,
  ],
  exports: [
    CreateOrderUseCase,
    GetOrderUseCase,
    ORDER_REPOSITORY_TOKEN,
    EVENT_PUBLISHER_TOKEN,
    LOGGER_TOKEN,
  ],
})
export class OrderModule {}
