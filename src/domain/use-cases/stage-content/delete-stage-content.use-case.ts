import { Injectable } from '@nestjs/common';
import {
  IStageContentRepository,
  IUserRepository,
} from 'src/domain/repositories';

interface Input {
  userId: string;
  stageContentId: string;
}

@Injectable()
export class DeleteStageContentUseCase {
  constructor(
    private readonly stageContentRepository: IStageContentRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute({ stageContentId, userId }: Input) {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const stageContent = await this.stageContentRepository.get(stageContentId);

    if (!stageContent) {
      throw new Error('Stage content not found');
    }

    stageContent.delete();

    await this.stageContentRepository.save(stageContent);
  }
}
