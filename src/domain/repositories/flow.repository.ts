import { FlowDetails, FlowEntity } from '../entities/flow.entity';

export abstract class IFlowRepository {
  abstract create(flow: FlowEntity): Promise<void>;
  abstract get(id: string): Promise<FlowEntity | null>;
  abstract update(flow: FlowEntity): Promise<void>;
  abstract findManyByUserId(userId): Promise<FlowEntity[]>;
  abstract getDetails(id: string): Promise<FlowDetails | null>;
  abstract findByPhoneNumber(phoneNumber: string): Promise<FlowEntity | null>;
}
