import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappGateway } from './whatsapp.gateway';
import { WhatsappController } from './whatsapp.controller';
import { DatabaseModule } from 'src/infra/database/database.module';
import { ProcessMessageUseCase } from 'src/domain/use-cases/flow-engine/process-message.use-case';
import { AuthenticationModule } from '../authentication/authentication.module';

@Module({
  imports: [DatabaseModule, AuthenticationModule],
  providers: [WhatsappService, WhatsappGateway, ProcessMessageUseCase],
  controllers: [WhatsappController],
  exports: [WhatsappService],
})
export class WhatsappModule {}
