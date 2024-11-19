import { Module } from '@nestjs/common';
import { ProductService } from './products.service';
import { ProductController } from './products.controller';
import { DatabaseModule } from '../../../common/database/database.module';
import { RedisModule } from '../../../common/redis/redis.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as process from 'node:process';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { JwtStrategy } from '../../../common/guards/jwt.strategy';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService, JwtAuthGuard, JwtStrategy],
})
export class ProductsModule {}
