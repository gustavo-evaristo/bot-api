import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/database/database.module';
import { ListConversationsUseCase } from 'src/domain/use-cases/conversation/list-conversations.use-case';
import { GetConversationUseCase } from 'src/domain/use-cases/conversation/get-conversation.use-case';
import { ListConversationsController } from './list-conversations.controller';
import { GetConversationController } from './get-conversation.controller';

@Module({
  imports: [DatabaseModule],
  providers: [ListConversationsUseCase, GetConversationUseCase],
  controllers: [ListConversationsController, GetConversationController],
})
export class ConversationModule {}
