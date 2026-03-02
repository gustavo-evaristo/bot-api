import { Controller, Module } from '@nestjs/common';
import { ListKanbansController } from './list-kanbans.controller';
import { GetKanbanController } from './get-kanban.controller';
import { UpdateKanbanController } from './update-kanban.controller';
import {
  ActiveKanbanUseCase,
  CreateKanbanUseCase,
  DeleteKanbanUseCase,
  DesactiveKanbanUseCase,
  DuplicateKanbanUseCase,
  GetKanbanUseCase,
  ListKanbansUseCase,
  UpdateKanbanPhoneNumberUseCase,
  UpdateKanbanUseCase,
} from 'src/domain/use-cases';
import { CreateKanbanController } from './create-kanban.controller';
import { DatabaseModule } from 'src/infra/database/database.module';
import { AuthenticationModule } from 'src/infra/authentication/authentication.module';
import { DuplicateKanbanController } from './duplicate-kanban.controller';
import { ActiveKanbanController } from './active-kanban.controller';
import { DesactiveKanbanController } from './desactive-kanban.controller';
import { UpdateKanbanPhoneNumberController } from './update-kanban-phone-number.controller';
import { DeleteKanbanController } from './delete-kanban.controller';

@Module({
  providers: [
    UpdateKanbanUseCase,
    ListKanbansUseCase,
    GetKanbanUseCase,
    CreateKanbanUseCase,
    DuplicateKanbanUseCase,
    ActiveKanbanUseCase,
    DesactiveKanbanUseCase,
    UpdateKanbanPhoneNumberUseCase,
    DeleteKanbanUseCase,
  ],
  controllers: [
    CreateKanbanController,
    ListKanbansController,
    GetKanbanController,
    UpdateKanbanController,
    DuplicateKanbanController,
    ActiveKanbanController,
    DesactiveKanbanController,
    UpdateKanbanPhoneNumberController,
    DeleteKanbanController,
  ],
  imports: [DatabaseModule, AuthenticationModule],
})
export class KanbanModule {}
