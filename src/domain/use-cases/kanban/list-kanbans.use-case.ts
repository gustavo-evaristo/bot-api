import { Injectable } from '@nestjs/common';
import { KanbanEntity } from 'src/domain/entities/kanban.entity';
import { IKanbanRepository, IUserRepository } from 'src/domain/repositories';

@Injectable()
export class ListKanbansUseCase {
  constructor(
    private readonly kanbanRepository: IKanbanRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<KanbanEntity[]> {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return this.kanbanRepository.findManyByUserId(userId);
  }
}
