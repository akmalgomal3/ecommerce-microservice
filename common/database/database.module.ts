import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

@Module({
  providers: [
    {
      provide: 'DATABASE_POOL',
      useValue: pool,
    },
  ],
  exports: ['DATABASE_POOL'],
})
export class DatabaseModule {}
