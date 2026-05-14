import { Module } from '@nestjs/common';
import { InfraModule } from './infra/infra.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './infra/redis/redis.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), RedisModule, InfraModule],
})
export class AppModule {}
