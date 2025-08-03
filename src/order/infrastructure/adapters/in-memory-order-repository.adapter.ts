import { Injectable } from '@nestjs/common';
import {
  Order,
  OrderStatus,
  OrderItem,
} from '../../domain/entities/order.entity';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { OrderId } from '../../domain/value-objects/order-id';
import { Money } from '../../domain/value-objects/money';

interface OrderData {
  id: string;
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: { amount: number; currency: string };
  }>;
  status: OrderStatus;
  createdAt: string;
}

@Injectable()
export class InMemoryOrderRepositoryAdapter implements OrderRepository {
  private orders = new Map<string, OrderData>();

  save(order: Order): Promise<void> {
    const orderData: OrderData = {
      id: order.id.value,
      customerId: order.customerId,
      items: order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: {
          amount: item.price.amount,
          currency: item.price.currency,
        },
      })),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    };

    this.orders.set(order.id.value, orderData);
    return Promise.resolve();
  }

  findById(id: OrderId): Promise<Order | null> {
    const orderData = this.orders.get(id.value);
    if (!orderData) {
      return Promise.resolve(null);
    }

    return Promise.resolve(this.mapToOrder(orderData));
  }

  findByCustomerId(customerId: string): Promise<Order[]> {
    const customerOrders = Array.from(this.orders.values()).filter(
      (order) => order.customerId === customerId,
    );

    return Promise.resolve(
      customerOrders.map((orderData) => this.mapToOrder(orderData)),
    );
  }

  delete(id: OrderId): Promise<void> {
    this.orders.delete(id.value);
    return Promise.resolve();
  }

  private mapToOrder(orderData: OrderData): Order {
    const items: OrderItem[] = orderData.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: new Money(item.price.amount, item.price.currency),
    }));

    const order = Order.create(orderData.customerId, items);
    order.clearEvents(); // Clear events since this is a reconstructed order
    return order;
  }
}
