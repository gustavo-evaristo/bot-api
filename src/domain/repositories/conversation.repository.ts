import { ConversationEntity } from '../entities/conversation.entity';

export abstract class IConversationRepository {
  abstract create(conversation: ConversationEntity): Promise<void>;
  abstract findActive(
    kanbanId: string,
    leadPhoneNumber: string,
  ): Promise<ConversationEntity | null>;
  abstract update(conversation: ConversationEntity): Promise<void>;
}
