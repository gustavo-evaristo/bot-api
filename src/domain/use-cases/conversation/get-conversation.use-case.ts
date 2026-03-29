import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { IConversationRepository } from 'src/domain/repositories/conversation.repository';
import { IMessageHistoryRepository } from 'src/domain/repositories/message-history.repository';
import { MessageHistoryEntity } from 'src/domain/entities/message-history.entity';

interface Input {
  conversationId: string;
  userId: string;
}

export interface GetConversationOutput {
  id: string;
  leadPhoneNumber: string;
  status: string;
  kanbanTitle: string;
  messages: {
    id: string;
    sender: string;
    content: string;
    sentAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetConversationUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly messageHistoryRepository: IMessageHistoryRepository,
  ) {}

  async execute({ conversationId, userId }: Input): Promise<GetConversationOutput> {
    const conversation =
      await this.conversationRepository.findById(conversationId);

    if (!conversation) throw new NotFoundException('Conversa não encontrada.');

    if (conversation.kanbanUserId !== userId)
      throw new ForbiddenException('Acesso negado.');

    const messages =
      await this.messageHistoryRepository.findManyByConversationId(
        conversationId,
      );

    return {
      id: conversation.id,
      leadPhoneNumber: conversation.leadPhoneNumber,
      status: conversation.status,
      kanbanTitle: conversation.kanbanTitle,
      messages: messages.map((m: MessageHistoryEntity) => ({
        id: m.id.toString(),
        sender: m.sender,
        content: m.content,
        sentAt: m.createdAt,
      })),
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }
}
