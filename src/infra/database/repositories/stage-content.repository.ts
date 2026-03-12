import { Injectable } from '@nestjs/common';
import {
  IContentType,
  StageContentEntity,
} from 'src/domain/entities/stage-content.entity';
import { IStageContentRepository } from 'src/domain/repositories';
import { PrismaService } from '../prisma.service';
import { Prisma } from 'generated/prisma/browser';

@Injectable()
export class StageContentRepository implements IStageContentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(stageContent: StageContentEntity): Promise<void> {
    const data: Prisma.stage_contentsCreateArgs['data'] = {
      ...stageContent,
      id: stageContent.id.toString(),
      stageId: stageContent.stageId.toString(),
    };

    await this.prismaService.stage_contents.create({ data });
  }

  async get(id: string): Promise<StageContentEntity | null> {
    const stageContent = await this.prismaService.stage_contents.findFirst({
      where: { id, isDeleted: false },
    });

    if (!stageContent) {
      return null;
    }

    return new StageContentEntity({
      ...stageContent,
      contentType: stageContent.contentType as IContentType,
    });
  }

  async save(stageContent: StageContentEntity): Promise<void> {
    const data: Prisma.stage_contentsUpdateArgs['data'] = {
      content: stageContent.content,
      contentType: stageContent.contentType,
      isDeleted: stageContent.isDeleted,
      updatedAt: stageContent.updatedAt,
    };

    await this.prismaService.stage_contents.update({
      where: { id: stageContent.id.toString() },
      data,
    });
  }
}
