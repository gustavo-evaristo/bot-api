import { StageContentEntity } from '../entities/stage-content.entity';

export abstract class IStageContentRepository {
  abstract get(id: string): Promise<StageContentEntity | null>;
  abstract create(stageContent: StageContentEntity): Promise<void>;
  abstract save(stageContent: StageContentEntity): Promise<void>;
}
