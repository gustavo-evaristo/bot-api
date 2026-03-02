import { Module } from '@nestjs/common';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { KanbanModule } from './controllers/kanban/kanban.module';
import { UserModule } from './controllers/user/user.module';

@Module({
  imports: [WhatsappModule, UserModule, KanbanModule],
})
export class InfraModule {}
