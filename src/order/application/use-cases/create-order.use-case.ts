import { Injectable, Inject } from '@nestjs/common';
import { Order, OrderItem } from '../../domain/entities/order.entity';
import type { OrderRepository } from '../../domain/repositories/order.repository';
import type { EventPublisher } from '../ports/event-publisher.port';
import type { Logger } from '../ports/logger.port';
import { ORDER_REPOSITORY_TOKEN, EVENT_PUBLISHER_TOKEN, LOGGER_TOKEN } from '../ports/tokens';
import { Money } from '../../domain/value-objects/money';

export interface CreateOrderCommand {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    currency?: string;
  }>;
}

export interface CreateOrderResult {
  orderId: string;
  totalAmount: number;
  currency: string;
}

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_TOKEN) private readonly orderRepository: OrderRepository,
    @Inject(EVENT_PUBLISHER_TOKEN) private readonly eventPublisher: EventPublisher,
    @Inject(LOGGER_TOKEN) private readonly logger: Logger
  ) {}

  async execute(command: CreateOrderCommand): Promise<CreateOrderResult> {
    this.logger.log(`Creating order for customer: ${command.customerId}`, 'CreateOrderUseCase');

    try {
      const orderItems: OrderItem[] = command.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: new Money(item.price, item.currency || 'EUR')
      }));

      const order = Order.create(command.customerId, orderItems);

      await this.orderRepository.save(order);

      const events = order.getUncommittedEvents();
      await this.eventPublisher.publishAll(events);
      order.markEventsAsCommitted();

      this.logger.log(`Order created successfully: ${order.id.value}`, 'CreateOrderUseCase');

      return {
        orderId: order.id.value,
        totalAmount: order.totalAmount.amount,
        currency: order.totalAmount.currency
      };
    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`, error.stack, 'CreateOrderUseCase');
      throw error;
    }
  }
}