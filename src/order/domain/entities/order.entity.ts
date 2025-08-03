import { AggregateRoot } from './aggregate-root';
import { OrderId } from '../value-objects/order-id';
import { Money } from '../value-objects/money';
import { OrderCreatedEvent } from '../events/order-created.event';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: Money;
}

export class Order extends AggregateRoot {
  private constructor(
    private readonly _id: OrderId,
    private readonly _customerId: string,
    private readonly _items: OrderItem[],
    private _status: OrderStatus,
    private readonly _createdAt: Date
  ) {
    super();
  }

  get id(): OrderId {
    return this._id;
  }

  get customerId(): string {
    return this._customerId;
  }

  get items(): OrderItem[] {
    return [...this._items];
  }

  get status(): OrderStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get totalAmount(): Money {
    return this._items.reduce(
      (total, item) => total.add(item.price.multiply(item.quantity)),
      new Money(0)
    );
  }

  static create(customerId: string, items: OrderItem[]): Order {
    if (!customerId || customerId.trim().length === 0) {
      throw new Error('Customer ID is required');
    }

    if (!items || items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    const orderId = OrderId.generate();
    const order = new Order(
      orderId,
      customerId,
      items,
      OrderStatus.PENDING,
      new Date()
    );

    order.addDomainEvent(
      new OrderCreatedEvent(
        orderId,
        customerId,
        order.totalAmount,
        items
      )
    );

    return order;
  }

  confirm(): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new Error('Only pending orders can be confirmed');
    }
    this._status = OrderStatus.CONFIRMED;
  }

  cancel(): void {
    if (this._status === OrderStatus.DELIVERED) {
      throw new Error('Cannot cancel delivered orders');
    }
    this._status = OrderStatus.CANCELLED;
  }

  ship(): void {
    if (this._status !== OrderStatus.CONFIRMED) {
      throw new Error('Only confirmed orders can be shipped');
    }
    this._status = OrderStatus.SHIPPED;
  }

  deliver(): void {
    if (this._status !== OrderStatus.SHIPPED) {
      throw new Error('Only shipped orders can be delivered');
    }
    this._status = OrderStatus.DELIVERED;
  }
}