import { IAnswerRepository } from 'src/domain/repositories';
import { PrismaService } from '../prisma.service';
import { AnswerEntity } from 'src/domain/entities/question.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AnswerRepository implements IAnswerRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createMany(answers: AnswerEntity[]): Promise<void> {
    const data = answers.map((answer) => ({
      ...answer,
      id: answer.id.toString(),
      stageContentId: answer.stageContentId.toString(),
    }));

    await this.prismaService.answers.createMany({ data });
  }

  async get(id: string): Promise<AnswerEntity | null> {
    const answer = await this.prismaService.answers.findFirst({
      where: { id, isDeleted: false },
    });

    if (!answer) {
      return null;
    }

    return new AnswerEntity(answer);
  }

  async deleteByStageContentId(stageContentId: string): Promise<void> {
    await this.prismaService.answers.updateMany({
      data: { isDeleted: true },
      where: { stageContentId },
    });
  }
}
