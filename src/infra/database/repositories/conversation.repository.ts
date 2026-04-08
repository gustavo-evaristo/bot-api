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
    type Row = {
      id: string;
      leadPhoneNumber: string;
      leadName: string | null;
      status: string;
      kanbanId: string;
      kanbanTitle: string;
      lastMessageContent: string | null;
      lastMessageSender: string | null;
      lastMessageSentAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
    };

    const rows = await this.prismaService.$queryRaw<Row[]>`
      SELECT * FROM (
        SELECT DISTINCT ON (c."leadPhoneNumber", c."kanbanId")
          c.id,
          c."leadPhoneNumber",
          c."leadName",
          c.status,
          k.id           AS "kanbanId",
          k.title        AS "kanbanTitle",
          mh.content     AS "lastMessageContent",
          mh.sender      AS "lastMessageSender",
          mh."createdAt" AS "lastMessageSentAt",
          c."createdAt",
          c."updatedAt"
        FROM conversations c
        JOIN kanbans k ON k.id = c."kanbanId"
        LEFT JOIN LATERAL (
          SELECT content, sender, "createdAt"
          FROM message_history
          WHERE "conversationId" = c.id
          ORDER BY "createdAt" DESC
          LIMIT 1
        ) mh ON true
        WHERE k."userId" = ${userId}
          AND k."isDeleted" = false
        ORDER BY c."leadPhoneNumber", c."kanbanId", c."updatedAt" DESC
      ) latest
      ORDER BY COALESCE(latest."lastMessageSentAt", latest."updatedAt") DESC
    `;

    return rows.map((r) => ({
      id: r.id,
      leadPhoneNumber: r.leadPhoneNumber,
      leadName: r.leadName,
      status: r.status,
      kanbanId: r.kanbanId,
      kanbanTitle: r.kanbanTitle,
      lastMessage:
        r.lastMessageContent !== null && r.lastMessageSender !== null && r.lastMessageSentAt !== null
          ? {
              content: r.lastMessageContent,
              sender: r.lastMessageSender,
              sentAt: r.lastMessageSentAt,
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
      kanbanId: r.kanbanId,
      leadPhoneNumber: r.leadPhoneNumber,
      leadName: r.leadName,
      status: r.status,
      kanbanTitle: r.kanban.title,
      kanbanUserId: r.kanban.userId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  async findIdsByLeadAndKanban(
    kanbanId: string,
    leadPhoneNumber: string,
  ): Promise<string[]> {
    const records = await this.prismaService.conversations.findMany({
      where: { kanbanId, leadPhoneNumber },
      select: { id: true },
    });

    return records.map((r) => r.id);
  }
}
