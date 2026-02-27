import { IKanbanRepository } from 'src/domain/repositories';
import { PrismaService } from '../prisma.service';
import { KanbanEntity } from 'src/domain/entities/kanban.entity';
import { Prisma } from 'generated/prisma/client';
import { UUID } from 'src/domain/entities/vos';
import { Injectable } from '@nestjs/common';

@Injectable()
export class KanbanRepository implements IKanbanRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(kanban: KanbanEntity): Promise<void> {
    const data: Prisma.kanbansCreateArgs['data'] = {
      ...kanban,
      id: kanban.id.toString(),
      userId: kanban.userId.toString(),
    };

    await this.prismaService.kanbans.create({ data });
  }

  async get(id: string): Promise<KanbanEntity | null> {
    const kanban = await this.prismaService.kanbans.findUnique({
      where: { id },
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
}
