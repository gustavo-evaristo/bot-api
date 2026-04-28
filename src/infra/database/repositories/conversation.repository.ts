import { Injectable } from '@nestjs/common';
import {
  ConversationDetail,
  ConversationSummary,
  IConversationRepository,
  LeadSummary,
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
        flowId: conversation.flowId.toString(),
        leadPhoneNumber: conversation.leadPhoneNumber,
        leadName: conversation.leadName,
        status: conversation.status,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
  }

  async findActive(
    flowId: string,
    leadPhoneNumber: string,
  ): Promise<ConversationEntity | null> {
    const conversation = await this.prismaService.conversations.findFirst({
      where: {
        flowId,
        leadPhoneNumber,
        status: ConversationStatus.ACTIVE,
      },
    });

    if (!conversation) return null;

    return new ConversationEntity({
      ...conversation,
      id: UUID.from(conversation.id),
      flowId: UUID.from(conversation.flowId),
    });
  }

  async update(conversation: ConversationEntity): Promise<void> {
    await this.prismaService.conversations.update({
      where: { id: conversation.id.toString() },
      data: {
        status: conversation.status,
        automationEnabled: conversation.automationEnabled,
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
      automationEnabled: boolean;
      flowId: string;
      flowTitle: string;
      kanbanStageName: string | null;
      lastMessageContent: string | null;
      lastMessageSender: string | null;
      lastMessageSentAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
    };

    const rows = await this.prismaService.$queryRaw<Row[]>`
      SELECT * FROM (
        SELECT DISTINCT ON (c."leadPhoneNumber", c."flowId")
          c.id,
          c."leadPhoneNumber",
          c."leadName",
          c.status,
          c."automationEnabled",
          k.id           AS "flowId",
          k.title        AS "flowTitle",
          ks.title       AS "kanbanStageName",
          mh.content     AS "lastMessageContent",
          mh.sender      AS "lastMessageSender",
          mh."createdAt" AS "lastMessageSentAt",
          c."createdAt",
          c."updatedAt"
        FROM conversations c
        JOIN flows k ON k.id = c."flowId"
        LEFT JOIN conversation_progress cp ON cp."conversationId" = c.id
        LEFT JOIN kanban_stages ks ON ks.id = cp."lastKanbanStageId"
          AND ks."isDeleted" = false
        LEFT JOIN LATERAL (
          SELECT content, sender, "createdAt"
          FROM message_history
          WHERE "conversationId" = c.id
          ORDER BY "createdAt" DESC
          LIMIT 1
        ) mh ON true
        WHERE k."userId" = ${userId}
          AND k."isDeleted" = false
        ORDER BY c."leadPhoneNumber", c."flowId", c."updatedAt" DESC
      ) latest
      ORDER BY COALESCE(latest."lastMessageSentAt", latest."updatedAt") DESC
    `;

    return rows.map((r) => ({
      id: r.id,
      leadPhoneNumber: r.leadPhoneNumber,
      leadName: r.leadName,
      status: r.status,
      automationEnabled: r.automationEnabled,
      flowId: r.flowId,
      flowTitle: r.flowTitle,
      kanbanStageName: r.kanbanStageName ?? null,
      lastMessage:
        r.lastMessageContent !== null &&
        r.lastMessageSender !== null &&
        r.lastMessageSentAt !== null
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
        flow: { select: { title: true, userId: true } },
      },
    });

    if (!r) return null;

    return {
      id: r.id,
      flowId: r.flowId,
      leadPhoneNumber: r.leadPhoneNumber,
      leadName: r.leadName,
      status: r.status,
      flowTitle: r.flow.title,
      flowUserId: r.flow.userId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  async findLeadsByUserId(userId: string): Promise<LeadSummary[]> {
    type Row = {
      id: string;
      leadPhoneNumber: string;
      leadName: string | null;
      status: string;
      flowId: string;
      flowTitle: string;
      createdAt: Date;
    };

    const rows = await this.prismaService.$queryRaw<Row[]>`
      SELECT * FROM (
        SELECT DISTINCT ON (c."leadPhoneNumber", c."flowId")
          c.id,
          c."leadPhoneNumber",
          c."leadName",
          c.status,
          k.id    AS "flowId",
          k.title AS "flowTitle",
          c."createdAt"
        FROM conversations c
        JOIN flows k ON k.id = c."flowId"
        WHERE k."userId" = ${userId}
          AND k."isDeleted" = false
        ORDER BY c."leadPhoneNumber", c."flowId", c."updatedAt" DESC
      ) leads
      ORDER BY leads."createdAt" DESC
    `;

    return rows;
  }

  async findLastFinished(
    flowId: string,
    leadPhoneNumber: string,
  ): Promise<ConversationEntity | null> {
    const r = await this.prismaService.conversations.findFirst({
      where: { flowId, leadPhoneNumber, status: ConversationStatus.FINISHED },
      orderBy: { updatedAt: 'desc' },
    });

    if (!r) return null;

    return new ConversationEntity({
      ...r,
      id: UUID.from(r.id),
      flowId: UUID.from(r.flowId),
    });
  }

  async findIdsByLeadAndKanban(
    flowId: string,
    leadPhoneNumber: string,
  ): Promise<string[]> {
    const records = await this.prismaService.conversations.findMany({
      where: { flowId, leadPhoneNumber },
      select: { id: true },
    });

    return records.map((r) => r.id);
  }

  async findByLeadPhone(
    userId: string,
    leadPhoneNumber: string,
  ): Promise<ConversationEntity | null> {
    const r = await this.prismaService.conversations.findFirst({
      where: {
        leadPhoneNumber,
        flow: { userId, isDeleted: false },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!r) return null;

    return new ConversationEntity({
      ...r,
      id: UUID.from(r.id),
      flowId: UUID.from(r.flowId),
    });
  }
}
