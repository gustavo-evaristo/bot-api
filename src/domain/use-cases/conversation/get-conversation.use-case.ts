import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
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
  leadName: string | null;
  status: string;
  flowTitle: string;
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

  async execute({
    conversationId,
    userId,
  }: Input): Promise<GetConversationOutput> {
    const conversation =
      await this.conversationRepository.findById(conversationId);

    if (!conversation) throw new NotFoundException('Conversa não encontrada.');

    if (conversation.flowUserId !== userId)
      throw new ForbiddenException('Acesso negado.');

    const allConversationIds =
      await this.conversationRepository.findIdsByLeadAndKanban(
        conversation.flowId,
        conversation.leadPhoneNumber,
      );

    const messages =
      await this.messageHistoryRepository.findManyByConversationIds(
        allConversationIds,
      );

    return {
      id: conversation.id,
      leadPhoneNumber: conversation.leadPhoneNumber,
      leadName: conversation.leadName,
      status: conversation.status,
      flowTitle: conversation.flowTitle,
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
