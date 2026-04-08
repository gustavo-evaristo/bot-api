import { MessageHistoryEntity } from '../entities/message-history.entity';

export abstract class IMessageHistoryRepository {
  abstract create(message: MessageHistoryEntity): Promise<void>;
  abstract findManyByConversationId(
    conversationId: string,
  ): Promise<MessageHistoryEntity[]>;
  abstract findManyByConversationIds(
    conversationIds: string[],
  ): Promise<MessageHistoryEntity[]>;
}
