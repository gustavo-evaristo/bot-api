import { Controller, Module } from '@nestjs/common';
import { ListKanbansController } from './list-kanbans.controller';
import { GetKanbanController } from './get-kanban.controller';
import { UpdateKanbanController } from './update-kanban.controller';
import {
  CreateKanbanUseCase,
  DuplicateKanbanUseCase,
  GetKanbanUseCase,
  ListKanbansUseCase,
  UpdateKanbanUseCase,
} from 'src/domain/use-cases';
import { CreateKanbanController } from './create-kanban.controller';
import { DatabaseModule } from 'src/infra/database/database.module';
import { AuthenticationModule } from 'src/infra/authentication/authentication.module';
import { DuplicateKanbanController } from './duplicate-kanban.controller';

@Module({
  providers: [
    UpdateKanbanUseCase,
    ListKanbansUseCase,
    GetKanbanUseCase,
    CreateKanbanUseCase,
    DuplicateKanbanUseCase,
  ],
  controllers: [
    CreateKanbanController,
    ListKanbansController,
    GetKanbanController,
    UpdateKanbanController,
    DuplicateKanbanController,
  ],
  imports: [DatabaseModule, AuthenticationModule],
})
export class KanbanModule {}
