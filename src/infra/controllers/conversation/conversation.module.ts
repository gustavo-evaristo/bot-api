import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/database/database.module';
import { AuthenticationModule } from 'src/infra/authentication/authentication.module';
import { ListConversationsUseCase } from 'src/domain/use-cases/conversation/list-conversations.use-case';
import { GetConversationUseCase } from 'src/domain/use-cases/conversation/get-conversation.use-case';
import { ListLeadsUseCase } from 'src/domain/use-cases/conversation/list-leads.use-case';
import { ListConversationsController } from './list-conversations.controller';
import { GetConversationController } from './get-conversation.controller';
import { ListLeadsController } from './list-leads.controller';

@Module({
  imports: [DatabaseModule, AuthenticationModule],
  providers: [ListConversationsUseCase, GetConversationUseCase, ListLeadsUseCase],
  controllers: [ListConversationsController, GetConversationController, ListLeadsController],
})
export class ConversationModule {}
