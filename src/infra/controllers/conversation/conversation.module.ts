import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/database/database.module';
import { AuthenticationModule } from 'src/infra/authentication/authentication.module';
import { WhatsappModule } from 'src/infra/whatsapp/whatsapp.module';
import { ListConversationsUseCase } from 'src/domain/use-cases/conversation/list-conversations.use-case';
import { GetConversationUseCase } from 'src/domain/use-cases/conversation/get-conversation.use-case';
import { ListLeadsUseCase } from 'src/domain/use-cases/conversation/list-leads.use-case';
import { SendMessageUseCase } from 'src/domain/use-cases/conversation/send-message.use-case';
import { ToggleAutomationUseCase } from 'src/domain/use-cases/conversation/toggle-automation.use-case';
import { ListConversationsController } from './list-conversations.controller';
import { GetConversationController } from './get-conversation.controller';
import { ListLeadsController } from './list-leads.controller';
import { SendMessageController } from './send-message.controller';
import { ToggleAutomationController } from './toggle-automation.controller';

@Module({
  imports: [DatabaseModule, AuthenticationModule, WhatsappModule],
  providers: [
    ListConversationsUseCase,
    GetConversationUseCase,
    ListLeadsUseCase,
    SendMessageUseCase,
    ToggleAutomationUseCase,
  ],
  controllers: [
    ListConversationsController,
    GetConversationController,
    ListLeadsController,
    SendMessageController,
    ToggleAutomationController,
  ],
})
export class ConversationModule {}
