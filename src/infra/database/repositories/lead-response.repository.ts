import { Injectable } from '@nestjs/common';
import { ILeadResponseRepository } from 'src/domain/repositories/lead-response.repository';
import { LeadResponseEntity } from 'src/domain/entities/lead-response.entity';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LeadResponseRepository implements ILeadResponseRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(response: LeadResponseEntity): Promise<void> {
    await this.prismaService.lead_responses.create({
      data: {
        id: response.id.toString(),
        conversationId: response.conversationId.toString(),
        stageContentId: response.stageContentId,
        responseText: response.responseText,
        answerId: response.answerId ?? null,
        score: response.score ?? null,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      },
    });
  }
}
