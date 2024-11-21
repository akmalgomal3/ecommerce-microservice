import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { RedisService } from '../../../common/redis/redis.service';
import {
  getAllProduct,
  getProductById,
  getTotalProductsCount,
  insertProduct,
} from '../../../queries/product.queries';

@Injectable()
export class ProductService {
  constructor(
    @Inject('DATABASE_POOL') private pool: Pool,
    private redisService: RedisService,
  ) {}

  async addProduct(
    name: string,
    price: number,
    description: string,
    stock: number,
    sellerId: string,
  ): Promise<any> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await insertProduct.run(
        { name, price, description, stock, seller_id: sellerId },
        client,
      );
      await client.query('COMMIT');
      await this.redisService.del(`product:${result[0].id}`); // Clear cache after insert
      return result[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getProductById(productId: string): Promise<any> {
    const cachedProduct = await this.redisService.get(`product:${productId}`);
    if (cachedProduct) {
      return JSON.parse(cachedProduct);
    }
    const client = await this.pool.connect();
    try {
      const result = await getProductById.run({ id: productId }, client);
      const product = result[0];
      if (product) {
        await this.redisService.set(
          `product:${productId}`,
          JSON.stringify(product),
          3600,
        );
      }
      return product;
    } finally {
      client.release();
    }
  }

  async getAllProducts(limit: number, offset: number): Promise<any[]> {
    const client = await this.pool.connect();
    try {
      return await getAllProduct.run({ limit, offset }, client);
    } finally {
      client.release();
    }
  }

  async getTotalProductsCount(): Promise<number> {
    const client = await this.pool.connect();
    try {
      const result = await getTotalProductsCount.run(undefined, client);
      return parseInt(result[0].count, 10);
    } finally {
      client.release();
    }
  }
}
