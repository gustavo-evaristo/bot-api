import { Injectable } from '@nestjs/common';
import { IConversationRepository } from 'src/domain/repositories/conversation.repository';
import { IMessageHistoryRepository } from 'src/domain/repositories/message-history.repository';
import {
  MessageHistoryEntity,
  MessageSender,
  MessageStatus,
} from 'src/domain/entities/message-history.entity';
import { ConversationStatus } from 'src/domain/entities/conversation.entity';
import { UUID } from 'src/domain/entities/vos';

interface ValidateInput {
  conversationId: string;
  userId: string;
}

interface ValidateOutput {
  leadPhoneNumber: string;
}

interface PersistInput {
  conversationId: string;
  content: string;
  whatsappMessageId?: string | null;
}

@Injectable()
export class SendMessageUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly messageHistoryRepository: IMessageHistoryRepository,
  ) {}

  async validate({
    conversationId,
    userId,
  }: ValidateInput): Promise<ValidateOutput> {
    const conversation =
      await this.conversationRepository.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversa não encontrada.');
    }

    if (conversation.flowUserId !== userId) {
      throw new Error('Acesso negado.');
    }

    const canSend =
      conversation.status === ConversationStatus.FINISHED ||
      !conversation.automationEnabled;
    if (!canSend) {
      throw new Error(
        'Só é possível enviar mensagens manualmente quando o fluxo finalizou ou a automação está desligada.',
      );
    }

    return { leadPhoneNumber: conversation.leadPhoneNumber };
  }

  async persist({
    conversationId,
    content,
    whatsappMessageId,
  }: PersistInput): Promise<void> {
    await this.messageHistoryRepository.create(
      new MessageHistoryEntity({
        conversationId: UUID.from(conversationId),
        sender: MessageSender.BOT,
        content,
        whatsappMessageId: whatsappMessageId ?? null,
        status: MessageStatus.SENT,
      }),
    );
  }
}
