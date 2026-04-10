import { Injectable } from '@nestjs/common';
import { IConversationRepository } from 'src/domain/repositories/conversation.repository';
import { IMessageHistoryRepository } from 'src/domain/repositories/message-history.repository';
import {
  MessageHistoryEntity,
  MessageSender,
} from 'src/domain/entities/message-history.entity';
import { ConversationStatus } from 'src/domain/entities/conversation.entity';
import { UUID } from 'src/domain/entities/vos';

interface Input {
  conversationId: string;
  userId: string;
  content: string;
}

interface Output {
  leadPhoneNumber: string;
}

@Injectable()
export class SendMessageUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly messageHistoryRepository: IMessageHistoryRepository,
  ) {}

  async execute({ conversationId, userId, content }: Input): Promise<Output> {
    const conversation =
      await this.conversationRepository.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversa não encontrada.');
    }

    if (conversation.kanbanUserId !== userId) {
      throw new Error('Acesso negado.');
    }

    if (conversation.status !== ConversationStatus.FINISHED) {
      throw new Error(
        'Só é possível enviar mensagens para leads que finalizaram o fluxo.',
      );
    }

    await this.messageHistoryRepository.create(
      new MessageHistoryEntity({
        conversationId: UUID.from(conversationId),
        sender: MessageSender.BOT,
        content,
      }),
    );

    return { leadPhoneNumber: conversation.leadPhoneNumber };
  }
}
