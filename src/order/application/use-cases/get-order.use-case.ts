import { Injectable, Inject } from '@nestjs/common';
import type { OrderRepository } from '../../domain/repositories/order.repository';
import { OrderId } from '../../domain/value-objects/order-id';
import type { Logger } from '../ports/logger.port';
import { ORDER_REPOSITORY_TOKEN, LOGGER_TOKEN } from '../ports/tokens';

export interface GetOrderQuery {
  orderId: string;
}

export interface GetOrderResult {
  orderId: string;
  customerId: string;
  status: string;
  totalAmount: number;
  currency: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  createdAt: Date;
}

@Injectable()
export class GetOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_TOKEN)
    private readonly orderRepository: OrderRepository,
    @Inject(LOGGER_TOKEN) private readonly logger: Logger,
  ) {}

  async execute(query: GetOrderQuery): Promise<GetOrderResult | null> {
    this.logger.log(`Getting order: ${query.orderId}`, 'GetOrderUseCase');

    try {
      const orderId = OrderId.fromString(query.orderId);
      const order = await this.orderRepository.findById(orderId);

      if (!order) {
        this.logger.warn(
          `Order not found: ${query.orderId}`,
          'GetOrderUseCase',
        );
        return null;
      }

      return {
        orderId: order.id.value,
        customerId: order.customerId,
        status: order.status,
        totalAmount: order.totalAmount.amount,
        currency: order.totalAmount.currency,
        items: order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price.amount,
        })),
        createdAt: order.createdAt,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to get order: ${errorMessage}`,
        errorStack,
        'GetOrderUseCase',
      );
      throw error;
    }
  }
}
