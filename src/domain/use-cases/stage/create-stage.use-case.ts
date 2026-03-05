import { Injectable } from '@nestjs/common';
import { StageEntity } from 'src/domain/entities/stage.entity';
import {
  IKanbanRepository,
  IStageRepository,
  IUserRepository,
} from 'src/domain/repositories';

interface Input {
  kanbanId: string;
  userId: string;
  title: string;
  description: string;
}

@Injectable()
export class CreateStageUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly stageRepository: IStageRepository,
    private readonly kanbanRepository: IKanbanRepository,
  ) {}

  async execute({ kanbanId, userId, title, description }: Input) {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const kanban = await this.kanbanRepository.get(kanbanId);

    if (!kanban) {
      throw new Error('Kanban not found');
    }

    if (!kanban.belongsTo(kanban.userId)) {
      throw new Error('User does not own this kanban');
    }

    const stage = new StageEntity({
      kanbanId,
      title,
      description,
    });

    await this.stageRepository.create(stage);
  }
}
