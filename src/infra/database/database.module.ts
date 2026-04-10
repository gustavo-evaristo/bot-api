import { Module } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { PrismaService } from './prisma.service';
import {
  IFlowNodeRepository,
  IKanbanRepository,
  INodeOptionRepository,
} from 'src/domain/repositories';
import { KanbanRepository } from './repositories/kanban.repository';
import { FlowNodeRepository } from './repositories/flow-node.repository';
import { NodeOptionRepository } from './repositories/node-option.repository';
import { IConversationRepository } from 'src/domain/repositories/conversation.repository';
import { ConversationRepository } from './repositories/conversation.repository';
import { IConversationProgressRepository } from 'src/domain/repositories/conversation-progress.repository';
import { ConversationProgressRepository } from './repositories/conversation-progress.repository';
import { ILeadResponseRepository } from 'src/domain/repositories/lead-response.repository';
import { LeadResponseRepository } from './repositories/lead-response.repository';
import { IMessageHistoryRepository } from 'src/domain/repositories/message-history.repository';
import { MessageHistoryRepository } from './repositories/message-history.repository';
import { IAnalyticsRepository } from 'src/domain/repositories/analytics.repository';
import { AnalyticsRepository } from './repositories/analytics.repository';
import { IWhatsAppSessionRepository } from 'src/domain/repositories/whatsapp-session.repository';
import { WhatsAppSessionRepository } from './repositories/whatsapp-session.repository';

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
      provide: IFlowNodeRepository,
      useClass: FlowNodeRepository,
    },
    {
      provide: INodeOptionRepository,
      useClass: NodeOptionRepository,
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
    {
      provide: IAnalyticsRepository,
      useClass: AnalyticsRepository,
    },
    {
      provide: IWhatsAppSessionRepository,
      useClass: WhatsAppSessionRepository,
    },
  ],
  exports: [
    PrismaService,
    IUserRepository,
    IKanbanRepository,
    IFlowNodeRepository,
    INodeOptionRepository,
    IConversationRepository,
    IConversationProgressRepository,
    ILeadResponseRepository,
    IMessageHistoryRepository,
    IAnalyticsRepository,
    IWhatsAppSessionRepository,
  ],
})
export class DatabaseModule {}
