import { StageEntity } from '../entities/stage.entity';

export abstract class IStageRepository {
  abstract get(id: string): Promise<StageEntity | null>;
  abstract create(stage: StageEntity): Promise<void>;
  abstract save(stage: StageEntity): Promise<void>;
}
