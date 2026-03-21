import { AnswerEntity } from '../entities/question.entity';

export abstract class IAnswerRepository {
  abstract get(id: string): Promise<AnswerEntity | null>;
  abstract createMany(answers: AnswerEntity[]): Promise<void>;
  abstract deleteByStageContentId(stageContentId: string): Promise<void>;
}
