import { Order } from '../entities/order.entity';
import { OrderId } from '../value-objects/order-id';

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
  findByCustomerId(customerId: string): Promise<Order[]>;
  delete(id: OrderId): Promise<void>;
}
