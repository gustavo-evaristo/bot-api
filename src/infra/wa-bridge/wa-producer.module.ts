import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WaJobProducerService } from './wa-job-producer.service';
import {
  WA_MESSAGE_QUEUE,
  WA_READ_QUEUE,
  WA_SESSION_QUEUE,
} from './wa-bridge.constants';

/**
 * Apenas o producer + filas BullMQ. Pode ser importado por qualquer modulo
 * (WhatsappModule, ConversationModule, etc.) sem criar ciclo. O consumer
 * (WaBridgeModule) que depende dele importa este aqui sem problemas.
 */
@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('REDIS_URL');
        if (!url) throw new Error('REDIS_URL eh obrigatorio para BullMQ.');
        return {
          connection: {
            url,
            maxRetriesPerRequest: null,
            enableReadyCheck: true,
          },
        };
      },
    }),
    BullModule.registerQueue(
      { name: WA_SESSION_QUEUE },
      { name: WA_MESSAGE_QUEUE },
      { name: WA_READ_QUEUE },
    ),
  ],
  providers: [WaJobProducerService],
  exports: [WaJobProducerService, BullModule],
})
export class WaProducerModule {}
