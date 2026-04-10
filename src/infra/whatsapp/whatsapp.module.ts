import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WhatsappService } from './whatsapp.service';
import { WhatsappGateway } from './whatsapp.gateway';
import { WhatsappController } from './whatsapp.controller';
import { DatabaseModule } from 'src/infra/database/database.module';
import { ProcessMessageUseCase } from 'src/domain/use-cases/flow-engine/process-message.use-case';
import { AuthenticationModule } from '../authentication/authentication.module';
import { FollowUpService } from './follow-up.service';
import { LeaderElectionService } from './leader-election.service';

@Module({
  imports: [ScheduleModule.forRoot(), DatabaseModule, AuthenticationModule],
  providers: [
    WhatsappService,
    WhatsappGateway,
    ProcessMessageUseCase,
    FollowUpService,
    LeaderElectionService,
  ],
  controllers: [WhatsappController],
  exports: [WhatsappService],
})
export class WhatsappModule {}
