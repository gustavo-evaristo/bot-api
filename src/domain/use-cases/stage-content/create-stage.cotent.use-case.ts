import { Injectable } from '@nestjs/common';
import { AnswerEntity } from 'src/domain/entities/question.entity';
import {
  ContentType,
  StageContentEntity,
} from 'src/domain/entities/stage-content.entity';
import {
  IAnswerRepository,
  IStageContentRepository,
  IStageRepository,
  IUserRepository,
} from 'src/domain/repositories';

type Answers = {
  content: string;
  score: number;
};

interface Input {
  userId: string;
  stageId: string;
  content: string;
  contentType: ContentType;
  answers?: Answers[];
}

@Injectable()
export class CreateStageContentUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly stageRepository: IStageRepository,
    private readonly stageContentRepository: IStageContentRepository,
    private readonly answerRepository: IAnswerRepository,
  ) {}

  async execute({ userId, stageId, content, contentType, answers }: Input) {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const stage = await this.stageRepository.get(stageId);

    if (!stage) {
      throw new Error('Stage not found');
    }

    const stageContent = new StageContentEntity({
      content,
      contentType,
      stageId,
    });

    await this.stageContentRepository.create(stageContent);

    if (stageContent.isMultipleChoicesContent() && answers?.length) {
      const answersToCreate = [];

      for (const answer of answers) {
        const answerEntity = new AnswerEntity({
          stageContentId: stageContent.id,
          content: answer.content,
          score: answer.score,
        });

        answersToCreate.push(answerEntity);
      }

      if (answersToCreate.length) {
        await this.answerRepository.createMany(answersToCreate);
      }
    }
  }
}
