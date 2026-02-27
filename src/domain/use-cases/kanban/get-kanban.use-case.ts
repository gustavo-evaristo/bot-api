import { Injectable } from '@nestjs/common';
import { KanbanEntity } from 'src/domain/entities/kanban.entity';
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

  async execute({ id, userId }: Input): Promise<KanbanEntity> {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const kanban = await this.kanbanRepository.get(id);

    if (!kanban) {
      throw new Error('Kanban not found');
    }

    if (!kanban.belongsTo(user.id)) {
      throw new Error('User does not own this kanban');
    }

    return kanban;
  }
}
