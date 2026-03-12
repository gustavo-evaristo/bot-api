import { Injectable } from '@nestjs/common';
import { AnswerEntity } from 'src/domain/entities/question.entity';
import { IContentType } from 'src/domain/entities/stage-content.entity';
import {
  IAnswerRepository,
  IStageContentRepository,
  IUserRepository,
} from 'src/domain/repositories';

type Answers = {
  content: string;
  score: number;
};

interface Input {
  userId: string;
  stageContentId: string;
  content: string;
  contentType: IContentType;
  answers?: Answers[];
}

@Injectable()
export class UpdateStageContentUseCase {
  constructor(
    private readonly stageContentRepository: IStageContentRepository,
    private readonly userRepository: IUserRepository,
    private readonly answerRepository: IAnswerRepository,
  ) {}

  async execute({
    stageContentId,
    userId,
    content,
    contentType,
    answers,
  }: Input) {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const stageContent = await this.stageContentRepository.get(stageContentId);

    if (!stageContent) {
      throw new Error('Stage content not found');
    }

    stageContent.update({
      content,
      contentType,
    });

    await this.stageContentRepository.save(stageContent);

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
