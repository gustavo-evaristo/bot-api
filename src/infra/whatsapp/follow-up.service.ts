import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { IConversationProgressRepository } from 'src/domain/repositories/conversation-progress.repository';
import { IMessageHistoryRepository } from 'src/domain/repositories/message-history.repository';
import { MessageHistoryEntity, MessageSender } from 'src/domain/entities/message-history.entity';
import { UUID } from 'src/domain/entities/vos';
import { WhatsappService } from './whatsapp.service';

@Injectable()
export class FollowUpService {
  private readonly logger = new Logger(FollowUpService.name);

  constructor(
    private readonly conversationProgressRepository: IConversationProgressRepository,
    private readonly messageHistoryRepository: IMessageHistoryRepository,
    private readonly whatsappService: WhatsappService,
  ) {}

  @Cron('*/5 * * * *')
  async sendConversationFollowUps() {
    const pending = await this.conversationProgressRepository.findPendingFollowUps(30);

    if (pending.length === 0) return;

    this.logger.log(`Enviando follow-up para ${pending.length} conversa(s) pendente(s)`);

    for (const { conversationId, leadPhoneNumber, userId, progress } of pending) {
      const message = 'Oi, ainda está por aí? 😊';

      try {
        await this.whatsappService.sendMessage(userId, leadPhoneNumber, message, conversationId);

        await this.messageHistoryRepository.create(
          new MessageHistoryEntity({
            conversationId: UUID.from(conversationId),
            sender: MessageSender.BOT,
            content: message,
          }),
        );

        progress.markFollowUpSent();
        await this.conversationProgressRepository.update(progress);
      } catch (error) {
        this.logger.error(`Erro ao enviar follow-up para ${leadPhoneNumber}:`, error);
      }
    }
  }
}
