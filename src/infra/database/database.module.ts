import { Module } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { PrismaService } from './prisma.service';
import {
  IAnswerRepository,
  IKanbanRepository,
  IStageContentRepository,
  IStageRepository,
} from 'src/domain/repositories';
import { KanbanRepository } from './repositories/kanban.repository';
import { StageRepository } from './repositories/stage.repository';
import { StageContentRepository } from './repositories/stage-content.repository';
import { AnswerRepository } from './repositories/answer.repository';
import { IConversationRepository } from 'src/domain/repositories/conversation.repository';
import { ConversationRepository } from './repositories/conversation.repository';
import { IConversationProgressRepository } from 'src/domain/repositories/conversation-progress.repository';
import { ConversationProgressRepository } from './repositories/conversation-progress.repository';
import { ILeadResponseRepository } from 'src/domain/repositories/lead-response.repository';
import { LeadResponseRepository } from './repositories/lead-response.repository';
import { IMessageHistoryRepository } from 'src/domain/repositories/message-history.repository';
import { MessageHistoryRepository } from './repositories/message-history.repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
    {
      provide: IKanbanRepository,
      useClass: KanbanRepository,
    },
    {
      provide: IStageRepository,
      useClass: StageRepository,
    },
    {
      provide: IStageContentRepository,
      useClass: StageContentRepository,
    },
    {
      provide: IAnswerRepository,
      useClass: AnswerRepository,
    },
    {
      provide: IConversationRepository,
      useClass: ConversationRepository,
    },
    {
      provide: IConversationProgressRepository,
      useClass: ConversationProgressRepository,
    },
    {
      provide: ILeadResponseRepository,
      useClass: LeadResponseRepository,
    },
    {
      provide: IMessageHistoryRepository,
      useClass: MessageHistoryRepository,
    },
  ],
  exports: [
    IUserRepository,
    IKanbanRepository,
    IStageRepository,
    IStageContentRepository,
    IAnswerRepository,
    IConversationRepository,
    IConversationProgressRepository,
    ILeadResponseRepository,
    IMessageHistoryRepository,
  ],
})
export class DatabaseModule {}
