import { Injectable } from '@nestjs/common';
import { IMessageHistoryRepository } from 'src/domain/repositories/message-history.repository';
import {
  MessageHistoryEntity,
  MessageSender,
} from 'src/domain/entities/message-history.entity';
import { UUID } from 'src/domain/entities/vos';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MessageHistoryRepository implements IMessageHistoryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(message: MessageHistoryEntity): Promise<void> {
    await this.prismaService.message_history.create({
      data: {
        id: message.id.toString(),
        conversationId: message.conversationId.toString(),
        sender: message.sender,
        content: message.content,
        createdAt: message.createdAt,
      },
    });
  }

  async findManyByConversationId(
    conversationId: string,
  ): Promise<MessageHistoryEntity[]> {
    const records = await this.prismaService.message_history.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    return records.map(
      (r) =>
        new MessageHistoryEntity({
          id: UUID.from(r.id),
          conversationId: UUID.from(r.conversationId),
          sender: r.sender as MessageSender,
          content: r.content,
          createdAt: r.createdAt,
        }),
    );
  }

  async findManyByConversationIds(
    conversationIds: string[],
  ): Promise<MessageHistoryEntity[]> {
    const records = await this.prismaService.message_history.findMany({
      where: { conversationId: { in: conversationIds } },
      orderBy: { createdAt: 'asc' },
    });

    return records.map(
      (r) =>
        new MessageHistoryEntity({
          id: UUID.from(r.id),
          conversationId: UUID.from(r.conversationId),
          sender: r.sender as MessageSender,
          content: r.content,
          createdAt: r.createdAt,
        }),
    );
  }
}
