import { Injectable } from '@nestjs/common';
import { KanbanEntity } from 'src/domain/entities/kanban.entity';
import { IUserRepository } from 'src/domain/repositories';
import { IKanbanRepository } from 'src/domain/repositories/kanban.repository';

interface Input {
  id: string;
  userId: string;
}

@Injectable()
export class ActiveKanbanUseCase {
  constructor(
    private readonly kanbanRepository: IKanbanRepository,
    private readonly userRepository: IUserRepository,
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

    kanban.active();

    await this.kanbanRepository.update(kanban);

    return kanban;
  }
}
