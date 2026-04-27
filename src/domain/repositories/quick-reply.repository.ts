import { QuickReplyEntity } from '../entities/quick-reply.entity';

export abstract class IQuickReplyRepository {
  abstract listByUserId(userId: string): Promise<QuickReplyEntity[]>;
  abstract getById(id: string): Promise<QuickReplyEntity | null>;
  abstract create(quickReply: QuickReplyEntity): Promise<void>;
  abstract save(quickReply: QuickReplyEntity): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
