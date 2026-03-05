import { Module } from '@nestjs/common';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { KanbanModule } from './controllers/kanban/kanban.module';
import { UserModule } from './controllers/user/user.module';
import { StageModule } from './controllers/stage/stage.module';

@Module({
  imports: [WhatsappModule, UserModule, KanbanModule, StageModule],
})
export class InfraModule {}
