import { KanbanEntity } from '../entities/kanban.entity';

export abstract class IKanbanRepository {
  abstract create(kanban: KanbanEntity): Promise<void>;
  abstract get(id: string): Promise<KanbanEntity | null>;
  abstract update(kanban: KanbanEntity): Promise<void>;
  abstract findManyByUserId(userId): Promise<KanbanEntity[]>;
}
