import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/database/database.module';
import { AuthenticationModule } from 'src/infra/authentication/authentication.module';
import { KanbanController } from './kanban.controller';
import { CreateKanbanUseCase } from 'src/domain/use-cases/kanban/create-kanban.use-case';
import { UpdateKanbanUseCase } from 'src/domain/use-cases/kanban/update-kanban.use-case';
import { DeleteKanbanUseCase } from 'src/domain/use-cases/kanban/delete-kanban.use-case';
import { ListKanbansUseCase } from 'src/domain/use-cases/kanban/list-kanbans.use-case';
import { GetKanbanBoardUseCase } from 'src/domain/use-cases/kanban/get-kanban-board.use-case';
import { CreateKanbanStageUseCase } from 'src/domain/use-cases/kanban/create-kanban-stage.use-case';
import { UpdateKanbanStageUseCase } from 'src/domain/use-cases/kanban/update-kanban-stage.use-case';
import { DeleteKanbanStageUseCase } from 'src/domain/use-cases/kanban/delete-kanban-stage.use-case';
import { ListKanbanStagesUseCase } from 'src/domain/use-cases/kanban/list-kanban-stages.use-case';
import { MoveLeadStageUseCase } from 'src/domain/use-cases/kanban/move-lead-stage.use-case';
import { ReorderKanbanStagesUseCase } from 'src/domain/use-cases/kanban/reorder-kanban-stages.use-case';

@Module({
  imports: [DatabaseModule, AuthenticationModule],
  providers: [
    CreateKanbanUseCase,
    UpdateKanbanUseCase,
    DeleteKanbanUseCase,
    ListKanbansUseCase,
    GetKanbanBoardUseCase,
    CreateKanbanStageUseCase,
    UpdateKanbanStageUseCase,
    DeleteKanbanStageUseCase,
    ListKanbanStagesUseCase,
    MoveLeadStageUseCase,
    ReorderKanbanStagesUseCase,
  ],
  controllers: [KanbanController],
})
export class KanbanModule {}
