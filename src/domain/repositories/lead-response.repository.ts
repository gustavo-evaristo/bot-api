import { LeadResponseEntity } from '../entities/lead-response.entity';

export abstract class ILeadResponseRepository {
  abstract create(response: LeadResponseEntity): Promise<void>;
}
