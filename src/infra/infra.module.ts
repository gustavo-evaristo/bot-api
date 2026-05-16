import { Module } from '@nestjs/common';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { FlowModule } from './controllers/flow/flow.module';
import { UserModule } from './controllers/user/user.module';
import { FlowNodeModule } from './controllers/flow-node/flow-node.module';
import { ConversationModule } from './controllers/conversation/conversation.module';
import { AnalyticsModule } from './controllers/analytics/analytics.module';
import { FormModule } from './controllers/form/form.module';
import { KanbanModule } from './controllers/kanban/kanban.module';
import { QuickReplyModule } from './controllers/quick-reply/quick-reply.module';
import { WaBridgeModule } from './wa-bridge/wa-bridge.module';
import { WaProducerModule } from './wa-bridge/wa-producer.module';

@Module({
  imports: [
    WaProducerModule,
    WhatsappModule,
    WaBridgeModule,
    UserModule,
    FlowModule,
    FlowNodeModule,
    ConversationModule,
    AnalyticsModule,
    FormModule,
    KanbanModule,
    QuickReplyModule,
  ],
})
export class InfraModule {}
