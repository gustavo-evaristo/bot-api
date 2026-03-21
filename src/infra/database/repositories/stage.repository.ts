import { Injectable } from '@nestjs/common';
import { IStageRepository } from 'src/domain/repositories';
import { PrismaService } from '../prisma.service';
import { StageEntity } from 'src/domain/entities/stage.entity';
import { Prisma } from 'generated/prisma/browser';

@Injectable()
export class StageRepository implements IStageRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(stage: StageEntity): Promise<void> {
    const data: Prisma.stagesCreateArgs['data'] = {
      ...stage,
      id: stage.id.toString(),
      kanbanId: stage.kanbanId.toString(),
    };

    await this.prismaService.stages.create({ data });
  }

  async get(id: string): Promise<StageEntity | null> {
    const stage = await this.prismaService.stages.findFirst({
      where: { id, isDeleted: false },
    });

    if (!stage) {
      return null;
    }

    return new StageEntity(stage);
  }

  async save(stage: StageEntity): Promise<void> {
    const {} = stage;

    const data: Prisma.stagesUpdateArgs['data'] = {
      description: stage.description,
      title: stage.title,
      isDeleted: stage.isDeleted,
      updatedAt: stage.updatedAt,
    };

    await this.prismaService.stages.update({
      where: { id: stage.id.toString() },
      data,
    });
  }
}
