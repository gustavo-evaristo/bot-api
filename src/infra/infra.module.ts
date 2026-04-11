import { Module } from '@nestjs/common';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { FlowModule } from './controllers/flow/flow.module';
import { UserModule } from './controllers/user/user.module';
import { FlowNodeModule } from './controllers/flow-node/flow-node.module';
import { ConversationModule } from './controllers/conversation/conversation.module';
import { AnalyticsModule } from './controllers/analytics/analytics.module';

@Module({
  imports: [
    WhatsappModule,
    UserModule,
    FlowModule,
    FlowNodeModule,
    ConversationModule,
    AnalyticsModule,
  ],
})
export class InfraModule {}
