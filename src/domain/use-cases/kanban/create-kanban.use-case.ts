import { Injectable } from '@nestjs/common';
import { KanbanEntity } from 'src/domain/entities/kanban.entity';
import { IKanbanRepository } from 'src/domain/repositories/kanban.repository';

interface Input {
  userId: string;
  title: string;
  description?: string | null;
}

@Injectable()
export class CreateKanbanUseCase {
  constructor(private readonly kanbanRepository: IKanbanRepository) {}

  async execute({ userId, title, description }: Input) {
    const kanban = new KanbanEntity({ userId, title, description });
    await this.kanbanRepository.create(kanban);
    return { id: kanban.id.value };
  }
}
