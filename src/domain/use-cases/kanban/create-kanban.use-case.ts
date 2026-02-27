import { Injectable } from '@nestjs/common';
import { KanbanEntity } from 'src/domain/entities/kanban.entity';
import { IKanbanRepository, IUserRepository } from 'src/domain/repositories';

interface Input {
  userId: string;
  title: string;
  description: string;
}

@Injectable()
export class CreateKanbanUseCase {
  constructor(
    private readonly kanbanRepository: IKanbanRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute({ title, description, userId }: Input): Promise<KanbanEntity> {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const kanban = new KanbanEntity({
      userId,
      title,
      description,
    });

    await this.kanbanRepository.create(kanban);

    return kanban;
  }
}
