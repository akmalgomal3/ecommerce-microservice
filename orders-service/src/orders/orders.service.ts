import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './orders.schema';
import { RedisService } from '../../../common/redis/redis.service';

@Injectable()
export class OrderService {
  constructor(
    @Inject('DATABASE_POOL') private pool: Pool,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private redisService: RedisService,
  ) {}

  async createOrder(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<any> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const cachedProduct = await this.redisService.get(`product:${productId}`);
      let product: { stock: number };
      if (cachedProduct) {
        product = JSON.parse(cachedProduct);
      } else {
        const result = await client.query(
          'SELECT * FROM productsMs WHERE id = $1',
          [productId],
        );
        product = result.rows[0];
        await this.redisService.set(
          `product:${productId}`,
          JSON.stringify(product),
          3600,
        );
      }
      if (product.stock < quantity) {
        throw new Error('Not enough stock');
      }
      await client.query(
        'UPDATE productsMs SET stock = stock - $1 WHERE id = $2',
        [quantity, productId],
      );
      await this.redisService.del(`product:${productId}`); // Clear cache after update
      const newOrder = new this.orderModel({
        userId,
        productId,
        quantity,
        status: 'Pending',
      });
      await newOrder.save();
      await client.query('COMMIT');
      return newOrder;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
