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

export interface KanbanListItem {
  id: string;
  title: string;
  description: string | null;
  stagesCount: number;
  activeLeadsCount: number;
  linkedFlowTitle: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export abstract class IKanbanRepository {
  abstract listByUserId(userId: string): Promise<KanbanEntity[]>;
  /**
   * Lista enriquecida com contagens (estágios, leads ativos) e o nome do
   * fluxo vinculado, em uma única query — usado pela tela de listagem.
   */
  abstract listByUserIdWithStats(userId: string): Promise<KanbanListItem[]>;
  abstract getById(id: string): Promise<KanbanEntity | null>;
  abstract create(kanban: KanbanEntity): Promise<void>;
  abstract save(kanban: KanbanEntity): Promise<void>;
  abstract getBoard(kanbanId: string): Promise<KanbanBoardResult>;
}
