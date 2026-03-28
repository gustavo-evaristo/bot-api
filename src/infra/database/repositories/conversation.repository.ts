import { Injectable } from '@nestjs/common';
import { IConversationRepository } from 'src/domain/repositories/conversation.repository';
import {
  ConversationEntity,
  ConversationStatus,
} from 'src/domain/entities/conversation.entity';
import { UUID } from 'src/domain/entities/vos';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ConversationRepository implements IConversationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(conversation: ConversationEntity): Promise<void> {
    await this.prismaService.conversations.create({
      data: {
        id: conversation.id.toString(),
        kanbanId: conversation.kanbanId.toString(),
        leadPhoneNumber: conversation.leadPhoneNumber,
        status: conversation.status,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
  }

  async findActive(
    kanbanId: string,
    leadPhoneNumber: string,
  ): Promise<ConversationEntity | null> {
    const conversation = await this.prismaService.conversations.findFirst({
      where: {
        kanbanId,
        leadPhoneNumber,
        status: ConversationStatus.ACTIVE,
      },
    });

    if (!conversation) return null;

    return new ConversationEntity({
      ...conversation,
      id: UUID.from(conversation.id),
      kanbanId: UUID.from(conversation.kanbanId),
    });
  }

  async update(conversation: ConversationEntity): Promise<void> {
    await this.prismaService.conversations.update({
      where: { id: conversation.id.toString() },
      data: {
        status: conversation.status,
        updatedAt: conversation.updatedAt,
      },
    });
  }
}
