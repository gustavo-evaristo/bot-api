import { Injectable } from '@nestjs/common';
import {
  IKanbanRepository,
  IStageRepository,
  IUserRepository,
} from 'src/domain/repositories';

interface Input {
  stageId: string;
  userId: string;
  title: string;
  description: string;
}

@Injectable()
export class UpdateStageUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly stageRepository: IStageRepository,
    private readonly kanbanRepository: IKanbanRepository,
  ) {}

  async execute({ stageId, userId, description, title }: Input) {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const stage = await this.stageRepository.get(stageId);

    if (!stage) {
      throw new Error('Stage not found');
    }

    const kanban = await this.kanbanRepository.get(stage.kanbanId.toString());

    if (!kanban) {
      throw new Error('Kanban not found');
    }

    if (!kanban.belongsTo(user.id)) {
      throw new Error('User does not own this kanban');
    }

    stage.update({
      title,
      description,
    });

    await this.stageRepository.save(stage);
  }
}
