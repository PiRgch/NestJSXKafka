import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  ValidationPipe,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateOrderUseCase } from '../../application/use-cases/create-order.use-case';
import { GetOrderUseCase } from '../../application/use-cases/get-order.use-case';
import { CreateOrderDto } from '../dto/create-order.dto';
import {
  CreateOrderResponseDto,
  OrderResponseDto,
} from '../dto/order-response.dto';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
  ) {}

  @Post()
  async createOrder(
    @Body(ValidationPipe) createOrderDto: CreateOrderDto,
  ): Promise<CreateOrderResponseDto> {
    try {
      const result = await this.createOrderUseCase.execute({
        customerId: createOrderDto.customerId,
        items: createOrderDto.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          currency: item.currency || 'EUR',
        })),
      });

      return {
        orderId: result.orderId,
        totalAmount: result.totalAmount,
        currency: result.currency,
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  @Get(':id')
  async getOrder(@Param('id') orderId: string): Promise<OrderResponseDto> {
    try {
      const result = await this.getOrderUseCase.execute({ orderId });

      if (!result) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      return {
        orderId: result.orderId,
        customerId: result.customerId,
        status: result.status,
        totalAmount: result.totalAmount,
        currency: result.currency,
        items: result.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        createdAt: result.createdAt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
