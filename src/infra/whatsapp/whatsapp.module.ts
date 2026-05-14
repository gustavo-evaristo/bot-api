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
import { OutboundWorkerService } from './outbound-worker.service';
import { IWhatsappStatusRepository } from 'src/domain/repositories/whatsapp-status.repository';
import { WhatsappStatusRepository } from './whatsapp-status.repository';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthenticationModule,
    RedisModule,
  ],
  providers: [
    WhatsappService,
    WhatsappGateway,
    ProcessMessageUseCase,
    FollowUpService,
    LeaderElectionService,
    OutboundWorkerService,
    {
      provide: IWhatsappStatusRepository,
      useClass: WhatsappStatusRepository,
    },
  ],
  controllers: [WhatsappController],
  exports: [WhatsappService, WhatsappGateway, IWhatsappStatusRepository],
})
export class WhatsappModule {}
