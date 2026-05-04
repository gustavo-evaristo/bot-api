import { Injectable } from '@nestjs/common';
import { IKanbanRepository } from 'src/domain/repositories/kanban.repository';

interface Input {
  userId: string;
}

@Injectable()
export class ListKanbansUseCase {
  constructor(private readonly kanbanRepository: IKanbanRepository) {}

  async execute({ userId }: Input) {
    return this.kanbanRepository.listByUserIdWithStats(userId);
  }
}
