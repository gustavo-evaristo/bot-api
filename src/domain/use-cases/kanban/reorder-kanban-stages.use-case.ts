import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UUID } from 'src/domain/entities/vos';
import { IKanbanRepository } from 'src/domain/repositories/kanban.repository';
import { IKanbanStageRepository } from 'src/domain/repositories/kanban-stage.repository';

interface Input {
  userId: string;
  kanbanId: string;
  stageIds: string[];
}

@Injectable()
export class ReorderKanbanStagesUseCase {
  constructor(
    private readonly kanbanRepository: IKanbanRepository,
    private readonly stageRepository: IKanbanStageRepository,
  ) {}

  async execute({ userId, kanbanId, stageIds }: Input) {
    const kanban = await this.kanbanRepository.getById(kanbanId);
    if (!kanban) throw new NotFoundException('Kanban não encontrado');
    if (!kanban.belongsTo(UUID.from(userId))) throw new ForbiddenException();

    const current = await this.stageRepository.listByKanbanId(kanbanId);
    const currentIds = new Set(current.map((s) => s.id.toString()));

    if (stageIds.length !== current.length) {
      throw new BadRequestException(
        'A lista deve conter todos os estágios do kanban',
      );
    }
    for (const id of stageIds) {
      if (!currentIds.has(id)) {
        throw new BadRequestException(`Estágio ${id} não pertence ao kanban`);
      }
    }

    const byId = new Map(current.map((s) => [s.id.toString(), s] as const));
    for (let i = 0; i < stageIds.length; i++) {
      const stage = byId.get(stageIds[i])!;
      if (stage.order === i) continue;
      stage.update(stage.title, stage.color, i);
      await this.stageRepository.save(stage);
    }
  }
}
