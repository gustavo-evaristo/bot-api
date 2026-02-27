import { Injectable } from '@nestjs/common';
import { KanbanEntity } from 'src/domain/entities/kanban.entity';
import { IKanbanRepository, IUserRepository } from 'src/domain/repositories';

interface Input {
  kanbanId: string;
  userId: string;
}

@Injectable()
export class DuplicateKanbanUseCase {
  constructor(
    private readonly kanbanRepository: IKanbanRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute({ kanbanId, userId }: Input): Promise<KanbanEntity> {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const kanban = await this.kanbanRepository.get(kanbanId);

    if (!kanban) {
      throw new Error('Kanban not found');
    }

    if (!kanban.belongsTo(user.id)) {
      throw new Error('User is not the owner of the kanban');
    }

    const duplicatedKanban = kanban.duplicate();

    await this.kanbanRepository.create(duplicatedKanban);

    return kanban;
  }
}
