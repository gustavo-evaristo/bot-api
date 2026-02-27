import { KanbamEntity } from '../entities/kanbam.entity';

export abstract class IKanbamRepository {
  abstract create(kanbam: KanbamEntity): Promise<void>;
  abstract get(id: string): Promise<KanbamEntity | null>;
  abstract update(kanbam: KanbamEntity): Promise<void>;
}
