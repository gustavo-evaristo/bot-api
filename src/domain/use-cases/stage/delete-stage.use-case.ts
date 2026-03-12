import { Injectable } from '@nestjs/common';
import { StageEntity } from 'src/domain/entities/stage.entity';
import {
  IKanbanRepository,
  IStageRepository,
  IUserRepository,
} from 'src/domain/repositories';

interface Input {
  stageId: string;
  userId: string;
}

@Injectable()
export class DeleteStageUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly stageRepository: IStageRepository,
    private readonly kanbanRepository: IKanbanRepository,
  ) {}

  async execute({ stageId, userId }: Input) {
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

    stage.delete();

    await this.stageRepository.save(stage);
  }
}
