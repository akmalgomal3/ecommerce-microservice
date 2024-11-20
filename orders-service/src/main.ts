import { NestFactory } from '@nestjs/core';
import { OrdersModule } from './orders/orders.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrdersModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'order',
        protoPath: join('../proto/order.proto'),
        url: 'localhost:3003',
      },
    },
  );
  await app.listen();
}
bootstrap();
