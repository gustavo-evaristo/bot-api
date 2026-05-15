import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CustomExceptionFilter } from './infra/middlewares/exception.middleware';
import { ValidationPipe } from '@nestjs/common';
import { RedisIoAdapter } from './infra/redis/redis-io.adapter';
import { REDIS_PUB, REDIS_SUB } from './infra/redis/redis.constants';
import type Redis from 'ioredis';

/**
 * Guard contra rodar localmente apontando para Redis/DB de producao.
 * Se em dev (NODE_ENV != production) detectamos URLs do dominio prod
 * (Upstash ou Supabase), abortamos antes de subir o app — evita o
 * cenario classico de "rodei pnpm dev e tirei o WhatsApp do ar".
 */
function assertNotPointingToProd() {
  if (process.env.NODE_ENV === 'production') return;
  const redis = process.env.REDIS_URL ?? '';
  const db = process.env.DATABASE_URL ?? '';
  const flag = (process.env.ALLOW_PROD_RESOURCES ?? '').toLowerCase();
  if (flag === 'true' || flag === '1') return;
  const prodMatch = (url: string, pattern: RegExp) =>
    url.length > 0 && pattern.test(url);
  // Heuristicas: hostnames com -prod ou DB Supabase com nome "consigpro"
  // (ajuste se voce muda os nomes). Bloqueia se reconhecer prod.
  const hits: string[] = [];
  if (prodMatch(redis, /crucial-penguin-124486/)) hits.push('REDIS_URL=prod');
  if (prodMatch(db, /consigpro(?!-dev)|consig\.pro/i)) hits.push('DATABASE_URL=prod');
  if (hits.length > 0) {
    // eslint-disable-next-line no-console
    console.error(
      `\n[ABORT] Tentando rodar em dev mas as URLs apontam para producao: ${hits.join(', ')}.\n` +
        `Use credenciais de dev (.env separado).\n` +
        `Se for intencional, defina ALLOW_PROD_RESOURCES=true.\n`,
    );
    process.exit(1);
  }
}

async function bootstrap() {
  assertNotPointingToProd();
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.useGlobalFilters(new CustomExceptionFilter());

  const pub = app.get<Redis | null>(REDIS_PUB, { strict: false });
  const sub = app.get<Redis | null>(REDIS_SUB, { strict: false });
  const ioAdapter = new RedisIoAdapter(app, pub, sub);
  await ioAdapter.init();
  app.useWebSocketAdapter(ioAdapter);

  const config = new DocumentBuilder()
    .setTitle('Consigpro API')
    .setDescription('Bot api teste')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT);

  console.log(`Listening on port ${process.env.PORT}`);
}

bootstrap();
