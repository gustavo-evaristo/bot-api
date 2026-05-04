import { Injectable } from '@nestjs/common';
import { KanbanEntity } from 'src/domain/entities/kanban.entity';
import { KanbanStageEntity } from 'src/domain/entities/kanban-stage.entity';
import { IKanbanRepository } from 'src/domain/repositories/kanban.repository';
import { IKanbanStageRepository } from 'src/domain/repositories/kanban-stage.repository';

interface Input {
  userId: string;
  title: string;
  description?: string | null;
  stages?: string[];
}

// Paleta padrão pra estágios criados sem cor explícita — bate com os
// tokens --stage-* do dashboard.css.
const STAGE_COLOR_PALETTE = [
  '#64748b',
  '#3b82f6',
  '#f97316',
  '#eab308',
  '#10b981',
];

@Injectable()
export class CreateKanbanUseCase {
  constructor(
    private readonly kanbanRepository: IKanbanRepository,
    private readonly stageRepository: IKanbanStageRepository,
  ) {}

  async execute({ userId, title, description, stages }: Input) {
    const kanban = new KanbanEntity({ userId, title, description });
    await this.kanbanRepository.create(kanban);

    const titles = (stages ?? [])
      .map((s) => (s ?? '').trim())
      .filter((s) => s.length > 0);

    if (titles.length > 0) {
      const kanbanId = kanban.id.value;
      let order = 0;
      for (const stageTitle of titles) {
        const color = STAGE_COLOR_PALETTE[order % STAGE_COLOR_PALETTE.length];
        const stage = new KanbanStageEntity({
          kanbanId,
          title: stageTitle,
          color,
          order,
        });
        await this.stageRepository.create(stage);
        order += 1;
      }
    }

    return { id: kanban.id.value };
  }
}
