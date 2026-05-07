import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IConversationRepository } from 'src/domain/repositories/conversation.repository';
import { IMessageHistoryRepository } from 'src/domain/repositories/message-history.repository';
import { MessageStatus } from 'src/domain/entities/message-history.entity';
import { WhatsappService } from 'src/infra/whatsapp/whatsapp.service';
import { WhatsappGateway } from 'src/infra/whatsapp/whatsapp.gateway';

interface Input {
  userId: string;
  conversationId: string;
}

@Injectable()
export class MarkConversationAsReadUseCase {
  private readonly logger = new Logger(MarkConversationAsReadUseCase.name);

  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly messageHistoryRepository: IMessageHistoryRepository,
    private readonly whatsappService: WhatsappService,
    private readonly whatsappGateway: WhatsappGateway,
  ) {}

  async execute({ userId, conversationId }: Input): Promise<void> {
    const conversation =
      await this.conversationRepository.findById(conversationId);
    if (!conversation) throw new NotFoundException('Conversa não encontrada');
    if (conversation.flowUserId !== userId) throw new ForbiddenException();

    const unread =
      await this.messageHistoryRepository.findUnreadLeadMessages(
        conversationId,
      );

    if (unread.length === 0) return;

    const remoteJid =
      conversation.leadPhoneNumber.replace('+', '') + '@s.whatsapp.net';

    const keys = unread
      .filter((m) => m.whatsappMessageId)
      .map((m) => ({
        id: m.whatsappMessageId as string,
        remoteJid,
        fromMe: false,
      }));

    if (keys.length > 0) {
      try {
        await this.whatsappService.markAsRead(userId, keys);
      } catch (err) {
        // Falha em sinalizar leitura ao WhatsApp não deve bloquear a UI local.
        this.logger.warn(
          `Falha ao enviar read receipt para WhatsApp (conversa ${conversationId}):`,
          err,
        );
      }
    }

    for (const m of unread) {
      if (!m.whatsappMessageId) continue;
      const result =
        await this.messageHistoryRepository.updateStatusByWhatsappId(
          m.whatsappMessageId,
          MessageStatus.READ,
        );
      if (result) {
        this.whatsappGateway.sendMessageStatus(userId, {
          conversationId: result.conversationId,
          whatsappMessageId: result.whatsappMessageId,
          status: result.status,
          statusUpdatedAt: result.statusUpdatedAt,
        });
      }
    }
  }
}
