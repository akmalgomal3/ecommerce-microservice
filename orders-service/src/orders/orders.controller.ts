import { Controller, SetMetadata, UseGuards } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { OrderService } from './orders.service';
import { ecommerce } from '../../../proto/ecommerce';
import CreateOrderRequest = ecommerce.CreateOrderRequest;
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Controller('orders-service/v1')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @GrpcMethod('OrderService', 'CreateOrder')
  @SetMetadata('role', ['buyer'])
  async createOrder(data: CreateOrderRequest): Promise<any> {
    const response = await this.orderService.createOrder(
      data.userId,
      data.productId,
      data.quantity,
    );
    if (response) {
      return {
        success: true,
        code: 201,
        data: {
          orderId: response.id,
        },
        error: null,
        meta: null,
      };
    } else {
      return {
        success: false,
        code: 400,
        data: null,
        error: {
          message: 'Failed to create order',
          details: null,
        },
        meta: null,
      };
    }
  }
}
