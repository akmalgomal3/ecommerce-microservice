import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { RedisService } from '../../../common/redis/redis.service';

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
      const result = await client.query(
        'INSERT INTO productsMs (name, price, description, stock, seller_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, price, description, stock, sellerId],
      );
      await client.query('COMMIT');
      await this.redisService.del(`product:${result.rows[0].id}`); // Clear cache after insert
      return result.rows[0];
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
      const result = await client.query(
        'SELECT * FROM productsMs WHERE id = $1',
        [productId],
      );
      const product = result.rows[0];
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
      const result = await client.query(
        `SELECT id as productId, name, price, description, stock, seller_id as sellerId FROM productsMs LIMIT $1 OFFSET $2`,
        [limit, offset],
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getTotalProductsCount(): Promise<number> {
    const client = await this.pool.connect();
    try {
      const result = await client.query('SELECT COUNT(*) FROM productsMs');
      return parseInt(result.rows[0].count, 10);
    } finally {
      client.release();
    }
  }
}
