export class OrderItemResponseDto {
  productId: string;
  quantity: number;
  price: number;
}

export class OrderResponseDto {
  orderId: string;
  customerId: string;
  status: string;
  totalAmount: number;
  currency: string;
  items: OrderItemResponseDto[];
  createdAt: Date;
}

export class CreateOrderResponseDto {
  orderId: string;
  totalAmount: number;
  currency: string;
}