import { IKanbamRepository } from 'src/domain/repositories';
import { PrismaService } from '../prisma.service';
import { KanbamEntity } from 'src/domain/entities/kanbam.entity';
import { Prisma } from 'generated/prisma/client';
import { UUID } from 'src/domain/entities/vos';
import { Injectable } from '@nestjs/common';

@Injectable()
export class KanbamRepository implements IKanbamRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(kanbam: KanbamEntity): Promise<void> {
    const data: Prisma.kanbamsCreateArgs['data'] = {
      ...kanbam,
      id: kanbam.id.toString(),
      userId: kanbam.userId.toString(),
    };

    await this.prismaService.kanbams.create({ data });
  }

  async get(id: string): Promise<KanbamEntity | null> {
    const kanbam = await this.prismaService.kanbams.findUnique({
      where: { id },
    });

    if (!kanbam) {
      return;
    }

    return new KanbamEntity({
      ...kanbam,
      id: UUID.from(kanbam.id),
      userId: UUID.from(kanbam.userId),
    });
  }

  async update(kanbam: KanbamEntity): Promise<void> {
    const id = kanbam.id.toString();

    const data = {
      isActive: kanbam.isActive,
      isDeleted: kanbam.isDeleted,
      title: kanbam.title,
      description: kanbam.description,
      imageUrl: kanbam.imageUrl,
      phoneNumber: kanbam.phoneNumber,
      createdAt: kanbam.createdAt,
      updatedAt: kanbam.updatedAt,
    };

    await this.prismaService.kanbams.update({
      where: { id },
      data,
    });
  }
}
