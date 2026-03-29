import { Injectable } from '@nestjs/common';
import {
  ConversationSummary,
  IConversationRepository,
} from 'src/domain/repositories/conversation.repository';

interface Input {
  userId: string;
}

export interface ListConversationsOutput {
  conversations: ConversationSummary[];
}

@Injectable()
export class ListConversationsUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository,
  ) {}

  async execute({ userId }: Input): Promise<ListConversationsOutput> {
    const conversations =
      await this.conversationRepository.findManyByUserId(userId);
    return { conversations };
  }
}
