import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderService } from './orders.service';
import { OrderController } from './orders.controller';
import { Order, OrderSchema } from './orders.schema';
import { ProductsModule } from '../../../products-service/src/products/products.module';
import { RedisModule } from '../../../common/redis/redis.module';
import { MongoModule } from '../../../common/database/mongo.module';
import { DatabaseModule } from '../../../common/database/database.module';
import { JwtModule } from '@nestjs/jwt';
import * as process from 'node:process';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { JwtStrategy } from '../../../common/guards/jwt.strategy';

@Module({
  imports: [
    MongoModule,
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    ProductsModule,
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
