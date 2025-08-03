import { DomainEvent } from './domain-event';
import { OrderId } from '../value-objects/order-id';
import { Money } from '../value-objects/money';

export class OrderCreatedEvent extends DomainEvent {
  constructor(
    public readonly orderId: OrderId,
    public readonly customerId: string,
    public readonly totalAmount: Money,
    public readonly items: Array<{ productId: string; quantity: number; price: Money }>
  ) {
    super();
  }

  getEventName(): string {
    return 'OrderCreated';
  }
}