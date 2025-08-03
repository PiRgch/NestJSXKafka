import { Module } from '@nestjs/common';

// Controllers
import { OrderController } from './interfaces/controllers/order.controller';

// Use Cases
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { GetOrderUseCase } from './application/use-cases/get-order.use-case';

// Ports
import type { OrderRepository } from './domain/repositories/order.repository';
import type { EventPublisher } from './application/ports/event-publisher.port';
import type { Logger } from './application/ports/logger.port';
import { ORDER_REPOSITORY_TOKEN, EVENT_PUBLISHER_TOKEN, LOGGER_TOKEN } from './application/ports/tokens';

// Adapters
import { InMemoryOrderRepositoryAdapter } from './infrastructure/adapters/in-memory-order-repository.adapter';
import { ConsoleEventPublisherAdapter } from './infrastructure/adapters/console-event-publisher.adapter';
import { NestJSLoggerAdapter } from './infrastructure/adapters/nestjs-logger.adapter';

@Module({
  controllers: [OrderController],
  providers: [
    // Use Cases
    CreateOrderUseCase,
    GetOrderUseCase,
    
    // Adapters (Infrastructure) - Development mode without Kafka
    {
      provide: ORDER_REPOSITORY_TOKEN,
      useClass: InMemoryOrderRepositoryAdapter,
    },
    {
      provide: EVENT_PUBLISHER_TOKEN,
      useClass: ConsoleEventPublisherAdapter,
    },
    {
      provide: LOGGER_TOKEN,
      useClass: NestJSLoggerAdapter,
    },
  ],
  exports: [
    CreateOrderUseCase,
    GetOrderUseCase,
    ORDER_REPOSITORY_TOKEN,
    EVENT_PUBLISHER_TOKEN,
    LOGGER_TOKEN,
  ],
})
export class OrderDevModule {}