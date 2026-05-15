import { Module } from '@nestjs/common';
import { InfraModule } from './infra/infra.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './infra/redis/redis.module';
import { StorageModule } from './infra/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    StorageModule,
    InfraModule,
  ],
})
export class AppModule {}
