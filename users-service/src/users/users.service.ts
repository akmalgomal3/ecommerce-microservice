import { Injectable, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../../common/redis/redis.service';
import { createUser, validateUser } from '../../../queries/user.queries';

@Injectable()
export class UserService {
  constructor(
    @Inject('DATABASE_POOL') private pool: Pool,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async createUser(
    username: string,
    password: string,
    role: string,
  ): Promise<any> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await createUser.run(
        { username, password: hashedPassword, role },
        client,
      );
      await client.query('COMMIT');
      await this.redisService.del(`user:${username}`); // Clear cache after insert
      return result[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async validateUser(username: string, password: string): Promise<any> {
    const cachedUser = await this.redisService.get(`user:${username}`);
    let user: { [x: string]: any; password: any };
    if (cachedUser) {
      user = JSON.parse(cachedUser);
    } else {
      const client = await this.pool.connect();
      try {
        const result = await validateUser.run({ username }, client);
        user = result[0];
        if (user) {
          await this.redisService.set(
            `user:${username}`,
            JSON.stringify(user),
            3600,
          );
        }
      } finally {
        client.release();
      }
    }
    if (user && (await bcrypt.compare(password, user.password))) {
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
