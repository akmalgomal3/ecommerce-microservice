import { Controller, SetMetadata, UseGuards } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { OrderService } from './orders.service';
import { order } from '../../../proto/order';
import CreateOrderRequest = order.CreateOrderRequest;
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { createResponse } from '../../../common/response/response.util';

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
      return createResponse(true, 201, {
        orderId: response.id,
      });
    } else {
      return createResponse(false, 400, null, {
        message: 'Failed to create order',
        details: null,
      });
    }
  }
}
