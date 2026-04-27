import { KanbanEntity } from '../entities/kanban.entity';

export interface KanbanLeadCard {
  conversationId: string;
  leadName: string | null;
  leadPhoneNumber: string;
  flowTitle: string;
}

export interface KanbanBoardStage {
  id: string;
  title: string;
  color: string | null;
  order: number;
  leads: KanbanLeadCard[];
}

export interface KanbanBoardResult {
  id: string;
  title: string;
  stages: KanbanBoardStage[];
}

export abstract class IKanbanRepository {
  abstract listByUserId(userId: string): Promise<KanbanEntity[]>;
  abstract getById(id: string): Promise<KanbanEntity | null>;
  abstract create(kanban: KanbanEntity): Promise<void>;
  abstract save(kanban: KanbanEntity): Promise<void>;
  abstract getBoard(kanbanId: string): Promise<KanbanBoardResult>;
}
