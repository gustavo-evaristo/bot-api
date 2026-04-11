import { IFlowRepository } from 'src/domain/repositories';
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

  async getDetails(id: string): Promise<FlowDetails | null> {
    const flow = await this.prismaService.flows.findUnique({
      where: { id, isDeleted: false },
      include: {
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

    return {
      id: flow.id,
      title: flow.title,
      userId: flow.userId,
      startNodeId: flow.startNodeId ?? null,
      nodes: flow.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        content: node.content,
        defaultNextNodeId: node.defaultNextNodeId ?? null,
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
}
