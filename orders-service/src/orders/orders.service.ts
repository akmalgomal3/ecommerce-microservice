import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './orders.schema';
import { getProductById } from '../../../queries/product.queries';
import { updateProductStock } from '../../../queries/order.queries';

@Injectable()
export class OrderService {
  constructor(
    @Inject('DATABASE_POOL') private pool: Pool,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async createOrder(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<any> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const product = await getProductById.run({ id: productId }, client);

      if (!product || product.length === 0) {
        new Error('Product not found');
      }
      if (product[0].stock < quantity) {
        new Error('Not enough stock');
      }
      await updateProductStock.run({ productId, quantity }, client);
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
      throw new Error(`Order creation failed: ${error.message}`);
    } finally {
      client.release();
    }
  }
}
