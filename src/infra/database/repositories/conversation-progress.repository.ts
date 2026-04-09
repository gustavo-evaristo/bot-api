import { Injectable } from '@nestjs/common';
import { subMinutes } from 'date-fns';
import {
  IConversationProgressRepository,
  PendingFollowUp,
} from 'src/domain/repositories/conversation-progress.repository';
import { ConversationProgressEntity } from 'src/domain/entities/conversation-progress.entity';
import { UUID } from 'src/domain/entities/vos';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ConversationProgressRepository
  implements IConversationProgressRepository
{
  constructor(private readonly prismaService: PrismaService) {}

  async create(progress: ConversationProgressEntity): Promise<void> {
    await this.prismaService.conversation_progress.create({
      data: {
        id: progress.id.toString(),
        conversationId: progress.conversationId.toString(),
        currentStageId: progress.currentStageId,
        currentStageContentId: progress.currentStageContentId,
        waitingForResponse: progress.waitingForResponse,
        waitingForResponseSince: progress.waitingForResponseSince,
        followUpSentAt: progress.followUpSentAt,
        createdAt: progress.createdAt,
        updatedAt: progress.updatedAt,
      },
    });
  }

  async findByConversationId(
    conversationId: string,
  ): Promise<ConversationProgressEntity | null> {
    const progress =
      await this.prismaService.conversation_progress.findUnique({
        where: { conversationId },
      });

    if (!progress) return null;

    return new ConversationProgressEntity({
      ...progress,
      id: UUID.from(progress.id),
      conversationId: UUID.from(progress.conversationId),
    });
  }

  async update(progress: ConversationProgressEntity): Promise<void> {
    await this.prismaService.conversation_progress.update({
      where: { conversationId: progress.conversationId.toString() },
      data: {
        currentStageId: progress.currentStageId,
        currentStageContentId: progress.currentStageContentId,
        waitingForResponse: progress.waitingForResponse,
        waitingForResponseSince: progress.waitingForResponseSince,
        followUpSentAt: progress.followUpSentAt,
        updatedAt: progress.updatedAt,
      },
    });
  }

  async findPendingFollowUps(thresholdMinutes: number): Promise<PendingFollowUp[]> {
    const threshold = subMinutes(new Date(), thresholdMinutes);

    const records = await this.prismaService.conversation_progress.findMany({
      where: {
        waitingForResponse: true,
        followUpSentAt: null,
        waitingForResponseSince: { lt: threshold },
        conversation: {
          kanban: { isActive: true, isDeleted: false },
        },
      },
      include: {
        conversation: {
          include: {
            kanban: true,
          },
        },
      },
    });

    return records.map((record) => ({
      conversationId: record.conversationId,
      leadPhoneNumber: record.conversation.leadPhoneNumber,
      userId: record.conversation.kanban.userId,
      progress: new ConversationProgressEntity({
        ...record,
        id: UUID.from(record.id),
        conversationId: UUID.from(record.conversationId),
      }),
    }));
  }
}
