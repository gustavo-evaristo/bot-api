import { KanbanStageEntity } from '../entities/kanban-stage.entity';

export abstract class IKanbanStageRepository {
  abstract listByKanbanId(kanbanId: string): Promise<KanbanStageEntity[]>;
  abstract getById(id: string): Promise<KanbanStageEntity | null>;
  abstract create(stage: KanbanStageEntity): Promise<void>;
  abstract save(stage: KanbanStageEntity): Promise<void>;
  abstract getMaxOrder(kanbanId: string): Promise<number>;
}
