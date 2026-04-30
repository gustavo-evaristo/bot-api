import { Injectable } from '@nestjs/common';
import { KanbanEntity } from 'src/domain/entities/kanban.entity';
import { UUID } from 'src/domain/entities/vos';
import {
  IKanbanRepository,
  KanbanBoardResult,
} from 'src/domain/repositories/kanban.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class KanbanRepository implements IKanbanRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async listByUserId(userId: string): Promise<KanbanEntity[]> {
    const rows = await this.prismaService.kanbans.findMany({
      where: { userId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(
      (r) => new KanbanEntity({ ...r, id: UUID.from(r.id), userId: UUID.from(r.userId) }),
    );
  }

  async getById(id: string): Promise<KanbanEntity | null> {
    const row = await this.prismaService.kanbans.findUnique({
      where: { id, isDeleted: false },
    });
    if (!row) return null;
    return new KanbanEntity({ ...row, id: UUID.from(row.id), userId: UUID.from(row.userId) });
  }

  async create(kanban: KanbanEntity): Promise<void> {
    await this.prismaService.kanbans.create({
      data: {
        id: kanban.id.toString(),
        userId: kanban.userId.toString(),
        title: kanban.title,
        description: kanban.description,
        isDeleted: kanban.isDeleted,
        createdAt: kanban.createdAt,
        updatedAt: kanban.updatedAt,
      },
    });
  }

  async save(kanban: KanbanEntity): Promise<void> {
    await this.prismaService.kanbans.update({
      where: { id: kanban.id.toString() },
      data: {
        title: kanban.title,
        description: kanban.description,
        isDeleted: kanban.isDeleted,
        updatedAt: kanban.updatedAt,
      },
    });
  }

  async getBoard(kanbanId: string): Promise<KanbanBoardResult> {
    const kanban = await this.prismaService.kanbans.findUnique({
      where: { id: kanbanId },
      select: { id: true, title: true },
    });

    const stages = await this.prismaService.kanban_stages.findMany({
      where: { kanbanId, isDeleted: false },
      orderBy: { order: 'asc' },
    });

    type LeadRow = {
      conversationId: string;
      leadName: string | null;
      leadPhoneNumber: string;
      flowTitle: string;
      kanbanStageId: string;
    };

    const leadRows = await this.prismaService.$queryRaw<LeadRow[]>`
      SELECT DISTINCT ON (c."leadPhoneNumber")
        c.id                      AS "conversationId",
        c."leadName",
        c."leadPhoneNumber",
        f.title                   AS "flowTitle",
        cp."lastKanbanStageId"    AS "kanbanStageId"
      FROM conversations c
      JOIN flows f ON f.id = c."flowId"
        AND f."kanbanId" = ${kanbanId}
        AND f."isDeleted" = false
      JOIN conversation_progress cp ON cp."conversationId" = c.id
        AND cp."lastKanbanStageId" IS NOT NULL
      WHERE c."isDeleted" = false
      ORDER BY c."leadPhoneNumber", c."updatedAt" DESC
    `;

    const leadsByStage = new Map<string, LeadRow[]>();
    for (const row of leadRows) {
      const list = leadsByStage.get(row.kanbanStageId) ?? [];
      list.push(row);
      leadsByStage.set(row.kanbanStageId, list);
    }

    return {
      id: kanban!.id,
      title: kanban!.title,
      stages: stages.map((s) => ({
        id: s.id,
        title: s.title,
        color: s.color,
        order: s.order,
        leads: (leadsByStage.get(s.id) ?? []).map((l) => ({
          conversationId: l.conversationId,
          leadName: l.leadName,
          leadPhoneNumber: l.leadPhoneNumber,
          flowTitle: l.flowTitle,
        })),
      })),
    };
  }
}
