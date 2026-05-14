import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import { REDIS_PUB } from './redis.constants';

const RENEW_SCRIPT = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("PEXPIRE", KEYS[1], ARGV[2])
else
  return 0
end
`;

const RELEASE_SCRIPT = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
else
  return 0
end
`;

export interface AcquiredLock {
  key: string;
  token: string;
}

@Injectable()
export class RedisLockService {
  private readonly logger = new Logger(RedisLockService.name);

  constructor(@Inject(REDIS_PUB) private readonly redis: Redis | null) {}

  isEnabled(): boolean {
    return this.redis !== null;
  }

  /**
   * Tenta adquirir um lock distribuído. Retorna o token se ganhou, null se
   * outro processo já é dono.
   *
   * Quando Redis não está configurado (REDIS_URL ausente), retorna um token
   * sintético — permite que a aplicação continue funcionando em dev local
   * sem Redis, com a ressalva de que NÃO há coordenação entre instâncias.
   */
  async acquire(key: string, ttlMs: number): Promise<AcquiredLock | null> {
    const token = randomUUID();
    if (!this.redis) {
      return { key, token };
    }
    const ok = await this.redis.set(key, token, 'PX', ttlMs, 'NX');
    if (ok === 'OK') {
      return { key, token };
    }
    return null;
  }

  /**
   * Renova o TTL do lock somente se ainda for o dono (CAS).
   * Retorna true se renovou, false se outro processo tomou.
   */
  async renew(lock: AcquiredLock, ttlMs: number): Promise<boolean> {
    if (!this.redis) return true;
    const res = (await this.redis.eval(
      RENEW_SCRIPT,
      1,
      lock.key,
      lock.token,
      String(ttlMs),
    )) as number;
    return res === 1;
  }

  /**
   * Libera o lock somente se ainda for o dono. Idempotente.
   */
  async release(lock: AcquiredLock): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.eval(RELEASE_SCRIPT, 1, lock.key, lock.token);
    } catch (err) {
      this.logger.warn(
        `Falha ao liberar lock ${lock.key}: ${(err as Error).message}`,
      );
    }
  }

  /**
   * Quem é o dono atual desse lock (para logs/diagnóstico).
   */
  async whoOwns(key: string): Promise<string | null> {
    if (!this.redis) return null;
    return this.redis.get(key);
  }
}
