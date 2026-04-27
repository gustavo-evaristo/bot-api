import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/database/database.module';
import { AuthenticationModule } from 'src/infra/authentication/authentication.module';
import { QuickReplyController } from './quick-reply.controller';
import { ListQuickRepliesUseCase } from 'src/domain/use-cases/quick-reply/list-quick-replies.use-case';
import { CreateQuickReplyUseCase } from 'src/domain/use-cases/quick-reply/create-quick-reply.use-case';
import { UpdateQuickReplyUseCase } from 'src/domain/use-cases/quick-reply/update-quick-reply.use-case';
import { DeleteQuickReplyUseCase } from 'src/domain/use-cases/quick-reply/delete-quick-reply.use-case';

@Module({
  imports: [DatabaseModule, AuthenticationModule],
  providers: [
    ListQuickRepliesUseCase,
    CreateQuickReplyUseCase,
    UpdateQuickReplyUseCase,
    DeleteQuickReplyUseCase,
  ],
  controllers: [QuickReplyController],
})
export class QuickReplyModule {}
