import { Module } from '@nestjs/common';
import {
  CreateUserController,
  GetProfileController,
  LoginController,
  UpdateKanbanController,
  CreateKanbanController,
  ListKanbansController,
} from './controllers';
import {
  CreateUserUseCase,
  LoginUseCase,
  GetProfileUseCase,
  CreateKanbanUseCase,
  UpdateKanbanUseCase,
  ListKanbansUseCase,
} from 'src/domain/use-cases';
import { DatabaseModule } from './database/database.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [DatabaseModule, AuthenticationModule, WhatsappModule],
  controllers: [
    CreateUserController,
    LoginController,
    GetProfileController,
    CreateKanbanController,
    UpdateKanbanController,
    ListKanbansController,
  ],
  providers: [
    CreateUserUseCase,
    LoginUseCase,
    GetProfileUseCase,
    CreateKanbanUseCase,
    UpdateKanbanUseCase,
    ListKanbansUseCase,
  ],
})
export class InfraModule {}
