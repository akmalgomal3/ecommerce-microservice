import { NestFactory } from '@nestjs/core';
import { ProductsModule } from './products/products.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ProductsModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'product',
        protoPath: join('../proto/product.proto'),
        url: 'localhost:3002',
      },
    },
  );
  await app.listen();
}
bootstrap();
