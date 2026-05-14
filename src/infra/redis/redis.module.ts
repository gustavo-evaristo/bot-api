import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';
import { REDIS_PUB, REDIS_SUB } from './redis.constants';
import { RedisLockService } from './redis-lock.service';

function createClient(name: string, url: string): Redis {
  const logger = new Logger(`Redis:${name}`);
  const isTls = url.startsWith('rediss://');
  const opts: RedisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: false,
    ...(isTls ? { tls: {} } : {}),
  };
  const client = new Redis(url, opts);
  client.on('ready', () => logger.log('connected'));
  client.on('error', (err) => logger.error(`error: ${err.message}`));
  client.on('reconnecting', () => logger.warn('reconnecting'));
  return client;
}

@Global()
@Module({
  providers: [
    {
      provide: REDIS_PUB,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis | null => {
        const url = config.get<string>('REDIS_URL');
        if (!url) {
          new Logger('RedisModule').warn(
            'REDIS_URL não definida — features Redis (lock, pub/sub adapter) ficam desabilitadas',
          );
          return null;
        }
        return createClient('pub', url);
      },
    },
    {
      provide: REDIS_SUB,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis | null => {
        const url = config.get<string>('REDIS_URL');
        if (!url) return null;
        return createClient('sub', url);
      },
    },
    RedisLockService,
  ],
  exports: [REDIS_PUB, REDIS_SUB, RedisLockService],
})
export class RedisModule {}
