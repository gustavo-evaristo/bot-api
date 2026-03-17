import { Injectable } from '@nestjs/common';
import { KanbanDetails, KanbanEntity } from 'src/domain/entities/kanban.entity';
import { IKanbanRepository, IUserRepository } from 'src/domain/repositories';

interface Input {
  userId: string;
  id: string;
}

@Injectable()
export class GetKanbanUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly kanbanRepository: IKanbanRepository,
  ) {}

  async execute({ id, userId }: Input): Promise<KanbanDetails> {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const kanban = await this.kanbanRepository.getDetails(id);

    if (!kanban) {
      throw new Error('Kanban not found');
    }

    if (kanban.userId !== userId) {
      throw new Error('User does not own this kanban');
    }

    return kanban;
  }
}
