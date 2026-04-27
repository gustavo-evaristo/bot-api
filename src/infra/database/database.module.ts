import { Module } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { PrismaService } from './prisma.service';
import {
  IFlowNodeRepository,
  IFlowRepository,
  INodeOptionRepository,
} from 'src/domain/repositories';
import { FlowRepository } from './repositories/flow.repository';
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
import { IFormRepository } from 'src/domain/repositories/form.repository';
import { FormRepository } from './repositories/form.repository';
import { IKanbanRepository } from 'src/domain/repositories/kanban.repository';
import { KanbanRepository } from './repositories/kanban.repository';
import { IKanbanStageRepository } from 'src/domain/repositories/kanban-stage.repository';
import { KanbanStageRepository } from './repositories/kanban-stage.repository';
import { IQuickReplyRepository } from 'src/domain/repositories/quick-reply.repository';
import { QuickReplyRepository } from './repositories/quick-reply.repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
    {
      provide: IFlowRepository,
      useClass: FlowRepository,
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
    {
      provide: IFormRepository,
      useClass: FormRepository,
    },
    {
      provide: IKanbanRepository,
      useClass: KanbanRepository,
    },
    {
      provide: IKanbanStageRepository,
      useClass: KanbanStageRepository,
    },
    {
      provide: IQuickReplyRepository,
      useClass: QuickReplyRepository,
    },
  ],
  exports: [
    PrismaService,
    IUserRepository,
    IFlowRepository,
    IFlowNodeRepository,
    INodeOptionRepository,
    IConversationRepository,
    IConversationProgressRepository,
    ILeadResponseRepository,
    IMessageHistoryRepository,
    IAnalyticsRepository,
    IWhatsAppSessionRepository,
    IFormRepository,
    IKanbanRepository,
    IKanbanStageRepository,
    IQuickReplyRepository,
  ],
})
export class DatabaseModule {}
