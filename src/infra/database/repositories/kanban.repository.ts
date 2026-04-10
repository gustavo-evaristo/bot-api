import { IKanbanRepository } from 'src/domain/repositories';
import { PrismaService } from '../prisma.service';
import { KanbanDetails, KanbanEntity } from 'src/domain/entities/kanban.entity';
import { Prisma } from 'generated/prisma/client';
import { UUID } from 'src/domain/entities/vos';
import { Injectable } from '@nestjs/common';

@Injectable()
export class KanbanRepository implements IKanbanRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(kanban: KanbanEntity): Promise<void> {
    const data: Prisma.kanbansCreateArgs['data'] = {
      id: kanban.id.toString(),
      userId: kanban.userId.toString(),
      isActive: kanban.isActive,
      isDeleted: kanban.isDeleted,
      title: kanban.title,
      description: kanban.description,
      imageUrl: kanban.imageUrl,
      phoneNumber: kanban.phoneNumber,
      startNodeId: kanban.startNodeId,
      createdAt: kanban.createdAt,
      updatedAt: kanban.updatedAt,
    };

    await this.prismaService.kanbans.create({ data });
  }

  async get(id: string): Promise<KanbanEntity | null> {
    const kanban = await this.prismaService.kanbans.findUnique({
      where: { id, isDeleted: false },
    });

    if (!kanban) {
      return;
    }

    return new KanbanEntity({
      ...kanban,
      id: UUID.from(kanban.id),
      userId: UUID.from(kanban.userId),
    });
  }

  async update(kanban: KanbanEntity): Promise<void> {
    const id = kanban.id.toString();

    const data = {
      isActive: kanban.isActive,
      isDeleted: kanban.isDeleted,
      title: kanban.title,
      description: kanban.description,
      imageUrl: kanban.imageUrl,
      phoneNumber: kanban.phoneNumber,
      startNodeId: kanban.startNodeId,
      createdAt: kanban.createdAt,
      updatedAt: kanban.updatedAt,
    };

    await this.prismaService.kanbans.update({
      where: { id },
      data,
    });
  }

  async findManyByUserId(userId: any): Promise<KanbanEntity[]> {
    const kanbans = await this.prismaService.kanbans.findMany({
      where: { userId, isDeleted: false },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return kanbans.map(
      (kanban) =>
        new KanbanEntity({
          ...kanban,
          id: UUID.from(kanban.id),
          userId: UUID.from(kanban.userId),
        }),
    );
  }

  async getDetails(id: string): Promise<KanbanDetails | null> {
    const kanban = await this.prismaService.kanbans.findUnique({
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

    if (!kanban) {
      return null;
    }

    return {
      id: kanban.id,
      title: kanban.title,
      description: kanban.description,
      userId: kanban.userId,
      startNodeId: kanban.startNodeId ?? null,
      nodes: kanban.nodes.map((node) => ({
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

  async findByPhoneNumber(phoneNumber: string): Promise<KanbanEntity | null> {
    const kanban = await this.prismaService.kanbans.findFirst({
      where: { phoneNumber, isActive: true, isDeleted: false },
    });

    if (!kanban) return null;

    return new KanbanEntity({
      ...kanban,
      id: UUID.from(kanban.id),
      userId: UUID.from(kanban.userId),
    });
  }
}
