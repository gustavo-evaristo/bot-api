import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { ProcessMessageUseCase } from 'src/domain/use-cases/flow-engine/process-message.use-case';
import { WaEventConsumerService } from './wa-event-consumer.service';
import { WaProducerModule } from './wa-producer.module';

/**
 * Consumer de eventos do wa-worker. Importa WhatsappModule para usar o
 * WhatsappGateway (roteamento Socket.IO para o frontend) e DatabaseModule
 * para acesso aos repos. O producer fica em WaProducerModule (sem ciclo).
 */
@Module({
  imports: [WaProducerModule, DatabaseModule, WhatsappModule],
  providers: [WaEventConsumerService, ProcessMessageUseCase],
})
export class WaBridgeModule {}
