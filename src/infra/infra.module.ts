import { Module } from '@nestjs/common';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { KanbanModule } from './controllers/kanban/kanban.module';
import { UserModule } from './controllers/user/user.module';
import { StageModule } from './controllers/stage/stage.module';
import { ConversationModule } from './controllers/conversation/conversation.module';

@Module({
  imports: [WhatsappModule, UserModule, KanbanModule, StageModule, ConversationModule],
})
export class InfraModule {}
