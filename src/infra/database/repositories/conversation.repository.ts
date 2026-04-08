import { Injectable } from '@nestjs/common';
import {
  ConversationDetail,
  ConversationSummary,
  IConversationRepository,
} from 'src/domain/repositories/conversation.repository';
import {
  ConversationEntity,
  ConversationStatus,
} from 'src/domain/entities/conversation.entity';
import { UUID } from 'src/domain/entities/vos';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ConversationRepository implements IConversationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(conversation: ConversationEntity): Promise<void> {
    await this.prismaService.conversations.create({
      data: {
        id: conversation.id.toString(),
        kanbanId: conversation.kanbanId.toString(),
        leadPhoneNumber: conversation.leadPhoneNumber,
        leadName: conversation.leadName,
        status: conversation.status,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
  }

  async findActive(
    kanbanId: string,
    leadPhoneNumber: string,
  ): Promise<ConversationEntity | null> {
    const conversation = await this.prismaService.conversations.findFirst({
      where: {
        kanbanId,
        leadPhoneNumber,
        status: ConversationStatus.ACTIVE,
      },
    });

    if (!conversation) return null;

    return new ConversationEntity({
      ...conversation,
      id: UUID.from(conversation.id),
      kanbanId: UUID.from(conversation.kanbanId),
    });
  }

  async update(conversation: ConversationEntity): Promise<void> {
    await this.prismaService.conversations.update({
      where: { id: conversation.id.toString() },
      data: {
        status: conversation.status,
        updatedAt: conversation.updatedAt,
      },
    });
  }

  async findManyByUserId(userId: string): Promise<ConversationSummary[]> {
    const records = await this.prismaService.conversations.findMany({
      where: {
        kanban: { userId, isDeleted: false },
      },
      include: {
        kanban: { select: { id: true, title: true } },
        messageHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return records.map((r) => ({
      id: r.id,
      leadPhoneNumber: r.leadPhoneNumber,
      leadName: r.leadName,
      status: r.status,
      kanbanId: r.kanban.id,
      kanbanTitle: r.kanban.title,
      lastMessage:
        r.messageHistory.length > 0
          ? {
              content: r.messageHistory[0].content,
              sender: r.messageHistory[0].sender,
              sentAt: r.messageHistory[0].createdAt,
            }
          : null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async findById(id: string): Promise<ConversationDetail | null> {
    const r = await this.prismaService.conversations.findUnique({
      where: { id },
      include: {
        kanban: { select: { title: true, userId: true } },
      },
    });

    if (!r) return null;

    return {
      id: r.id,
      leadPhoneNumber: r.leadPhoneNumber,
      leadName: r.leadName,
      status: r.status,
      kanbanTitle: r.kanban.title,
      kanbanUserId: r.kanban.userId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}
