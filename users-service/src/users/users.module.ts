import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { DatabaseModule } from '../../../common/database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../../common/guards/jwt.strategy';
import * as dotenv from 'dotenv';
import { RedisModule } from '../../../common/redis/redis.module';

dotenv.config();

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    RedisModule,
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
})
export class UsersModule {}
