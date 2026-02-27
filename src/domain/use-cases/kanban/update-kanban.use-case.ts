import { Injectable } from '@nestjs/common';
import { KanbanEntity } from 'src/domain/entities/kanban.entity';
import { IKanbanRepository, IUserRepository } from 'src/domain/repositories';

interface Input {
  id: string;
  userId: string;
  title: string;
  description: string;
  imageUrl: string | null;
}

@Injectable()
export class UpdateKanbanUseCase {
  constructor(
    private readonly kanbanRepository: IKanbanRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute({
    id,
    userId,
    title,
    description,
    imageUrl,
  }: Input): Promise<KanbanEntity> {
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

    kanban.update({
      title,
      description,
      imageUrl,
    });

    await this.kanbanRepository.update(kanban);

    return kanban;
  }
}
