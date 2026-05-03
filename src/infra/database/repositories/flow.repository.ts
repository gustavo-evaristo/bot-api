import { FlowListItem, IFlowRepository } from 'src/domain/repositories';
import { PrismaService } from '../prisma.service';
import { FlowDetails, FlowEntity } from 'src/domain/entities/flow.entity';
import { Prisma } from 'generated/prisma/client';
import { UUID } from 'src/domain/entities/vos';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FlowRepository implements IFlowRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(flow: FlowEntity): Promise<void> {
    const data: Prisma.flowsCreateArgs['data'] = {
      id: flow.id.toString(),
      userId: flow.userId.toString(),
      isActive: flow.isActive,
      isDeleted: flow.isDeleted,
      title: flow.title,
      description: flow.description,
      phoneNumber: flow.phoneNumber,
      startNodeId: flow.startNodeId,
      kanbanId: flow.kanbanId,
      createdAt: flow.createdAt,
      updatedAt: flow.updatedAt,
    };

    await this.prismaService.flows.create({ data });
  }

  async get(id: string): Promise<FlowEntity | null> {
    const flow = await this.prismaService.flows.findUnique({
      where: { id, isDeleted: false },
    });

    if (!flow) {
      return;
    }

    return new FlowEntity({
      ...flow,
      id: UUID.from(flow.id),
      userId: UUID.from(flow.userId),
    });
  }

  async update(flow: FlowEntity): Promise<void> {
    const id = flow.id.toString();

    const data = {
      isActive: flow.isActive,
      isDeleted: flow.isDeleted,
      title: flow.title,
      description: flow.description,
      phoneNumber: flow.phoneNumber,
      startNodeId: flow.startNodeId,
      kanbanId: flow.kanbanId,
      createdAt: flow.createdAt,
      updatedAt: flow.updatedAt,
    };

    await this.prismaService.flows.update({
      where: { id },
      data,
    });
  }

  async findManyByUserId(userId: any): Promise<FlowEntity[]> {
    const flows = await this.prismaService.flows.findMany({
      where: { userId, isDeleted: false },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return flows.map(
      (flow) =>
        new FlowEntity({
          ...flow,
          id: UUID.from(flow.id),
          userId: UUID.from(flow.userId),
        }),
    );
  }

  async findManyByUserIdWithStats(userId: string): Promise<FlowListItem[]> {
    type Row = {
      id: string;
      isActive: boolean;
      title: string;
      description: string | null;
      phoneNumber: string | null;
      kanbanId: string | null;
      kanbanTitle: string | null;
      leadsCount: bigint;
      messagesCount: bigint;
      createdAt: Date;
      updatedAt: Date;
    };

    const rows = await this.prismaService.$queryRaw<Row[]>`
      SELECT
        f.id,
        f."isActive",
        f.title,
        f.description,
        f."phoneNumber",
        f."kanbanId",
        k.title AS "kanbanTitle",
        COUNT(DISTINCT c.id)::bigint AS "leadsCount",
        COUNT(mh.id)::bigint AS "messagesCount",
        f."createdAt",
        f."updatedAt"
      FROM flows f
      LEFT JOIN kanbans k ON k.id = f."kanbanId" AND k."isDeleted" = false
      LEFT JOIN conversations c ON c."flowId" = f.id AND c."isDeleted" = false
      LEFT JOIN message_history mh ON mh."conversationId" = c.id
      WHERE f."userId" = ${userId}
        AND f."isDeleted" = false
      GROUP BY f.id, k.title
      ORDER BY f."createdAt" DESC
    `;

    return rows.map((r) => ({
      id: r.id,
      isActive: r.isActive,
      title: r.title,
      description: r.description,
      phoneNumber: r.phoneNumber,
      kanbanId: r.kanbanId,
      kanbanTitle: r.kanbanTitle,
      leadsCount: Number(r.leadsCount),
      messagesCount: Number(r.messagesCount),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async getDetails(id: string): Promise<FlowDetails | null> {
    // Carrega flow + nós + opções + título do kanban vinculado + sessão WhatsApp
    // do usuário em uma única chamada (Prisma usa subqueries no mesmo round-trip).
    const flow = await this.prismaService.flows.findUnique({
      where: { id, isDeleted: false },
      include: {
        kanban: { select: { title: true, isDeleted: true } },
        nodes: {
          where: { isDeleted: false },
          include: {
            options: {
              where: { isDeleted: false },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!flow) {
      return null;
    }

    const session = await this.prismaService.whatsapp_sessions.findUnique({
      where: { userId: flow.userId },
      select: { connectionStatus: true, connectedPhone: true },
    });

    const kanbanTitle =
      flow.kanban && !flow.kanban.isDeleted ? flow.kanban.title : null;

    return {
      id: flow.id,
      title: flow.title,
      userId: flow.userId,
      isActive: flow.isActive,
      phoneNumber: flow.phoneNumber ?? null,
      kanbanId: flow.kanbanId ?? null,
      kanbanTitle,
      startNodeId: flow.startNodeId ?? null,
      whatsappStatus: session?.connectionStatus ?? null,
      whatsappConnectedPhone: session?.connectedPhone ?? null,
      nodes: flow.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        content: node.content,
        defaultNextNodeId: node.defaultNextNodeId ?? null,
        kanbanStageId: node.kanbanStageId ?? null,
        postFillKanbanStageId: node.postFillKanbanStageId ?? null,
        formId: node.formId ?? null,
        x: node.x,
        y: node.y,
        options: node.options.map((opt) => ({
          id: opt.id,
          content: opt.content,
          score: opt.score,
          order: opt.order,
          nextNodeId: opt.nextNodeId ?? null,
        })),
      })),
    };
  }

  async activatePendingByUserAndPhone(
    userId: string,
    phoneNumber: string,
  ): Promise<number> {
    const result = await this.prismaService.flows.updateMany({
      where: {
        userId,
        phoneNumber,
        isActive: false,
        isDeleted: false,
      },
      data: {
        isActive: true,
        updatedAt: new Date(),
      },
    });
    return result.count;
  }

  async deactivateActiveByUserAndPhone(
    userId: string,
    phoneNumber: string,
  ): Promise<number> {
    const result = await this.prismaService.flows.updateMany({
      where: {
        userId,
        phoneNumber,
        isActive: true,
        isDeleted: false,
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
    return result.count;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<FlowEntity | null> {
    const flow = await this.prismaService.flows.findFirst({
      where: { phoneNumber, isActive: true, isDeleted: false },
    });

    if (!flow) return null;

    return new FlowEntity({
      ...flow,
      id: UUID.from(flow.id),
      userId: UUID.from(flow.userId),
    });
  }

  async duplicate(flowId: string, userId: string): Promise<string> {
    const source = await this.prismaService.flows.findFirst({
      where: { id: flowId, userId, isDeleted: false },
      include: {
        nodes: {
          where: { isDeleted: false },
          include: {
            options: { where: { isDeleted: false } },
          },
        },
      },
    });

    if (!source) {
      throw new Error('Flow not found');
    }

    const newFlowId = UUID.generate().toString();
    const nodeIdMap = new Map<string, string>();
    for (const node of source.nodes) {
      nodeIdMap.set(node.id, UUID.generate().toString());
    }

    return this.prismaService.$transaction(async (tx) => {
      await tx.flows.create({
        data: {
          id: newFlowId,
          userId: source.userId,
          isActive: false,
          isDeleted: false,
          title: `${source.title} (cópia)`,
          description: source.description,
          phoneNumber: null,
          startNodeId: source.startNodeId
            ? (nodeIdMap.get(source.startNodeId) ?? null)
            : null,
          kanbanId: source.kanbanId,
        },
      });

      for (const node of source.nodes) {
        const newNodeId = nodeIdMap.get(node.id)!;
        const remappedDefaultNext = node.defaultNextNodeId
          ? (nodeIdMap.get(node.defaultNextNodeId) ?? null)
          : null;
        await tx.flow_nodes.create({
          data: {
            id: newNodeId,
            flowId: newFlowId,
            type: node.type,
            content: node.content,
            defaultNextNodeId: remappedDefaultNext,
            kanbanStageId: node.kanbanStageId,
            postFillKanbanStageId: node.postFillKanbanStageId,
            formId: node.formId,
            x: node.x,
            y: node.y,
            isDeleted: false,
          },
        });
      }

      for (const node of source.nodes) {
        const newNodeId = nodeIdMap.get(node.id)!;
        for (const option of node.options) {
          const remappedNext = option.nextNodeId
            ? (nodeIdMap.get(option.nextNodeId) ?? null)
            : null;
          await tx.node_options.create({
            data: {
              id: UUID.generate().toString(),
              nodeId: newNodeId,
              content: option.content,
              score: option.score,
              order: option.order,
              nextNodeId: remappedNext,
              isDeleted: false,
            },
          });
        }
      }

      return newFlowId;
    });
  }
}
