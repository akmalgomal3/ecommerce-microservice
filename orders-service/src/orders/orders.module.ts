import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderService } from './orders.service';
import { OrderController } from './orders.controller';
import { Order, OrderSchema } from './orders.schema';
import { RedisModule } from '../../../common/redis/redis.module';
import { MongoModule } from '../../../common/database/mongo.module';
import { DatabaseModule } from '../../../common/database/database.module';
import { JwtModule } from '@nestjs/jwt';
import * as process from 'node:process';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { JwtStrategy } from '../../../common/guards/jwt.strategy';
import { productsGrpcOptions } from '../../grpc-client.options';
import { ClientsModule } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PRODUCTS_PACKAGE',
        ...productsGrpcOptions,
      },
    ]),
    MongoModule,
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    RedisModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    DatabaseModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, JwtAuthGuard, JwtStrategy],
})
export class OrdersModule {}
