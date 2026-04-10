import { ConversationProgressEntity } from '../entities/conversation-progress.entity';

export interface PendingFollowUp {
  conversationId: string;
  leadPhoneNumber: string;
  userId: string;
  progress: ConversationProgressEntity;
}

export abstract class IConversationProgressRepository {
  abstract create(progress: ConversationProgressEntity): Promise<void>;
  abstract findByConversationId(
    conversationId: string,
  ): Promise<ConversationProgressEntity | null>;
  abstract update(progress: ConversationProgressEntity): Promise<void>;
  abstract findPendingFollowUps(
    thresholdMinutes: number,
  ): Promise<PendingFollowUp[]>;
}
