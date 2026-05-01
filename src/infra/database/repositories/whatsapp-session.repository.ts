import { Injectable } from '@nestjs/common';
import {
  IWhatsAppSessionRepository,
  WhatsappConnectionInfo,
  WhatsappConnectionStatus,
} from 'src/domain/repositories/whatsapp-session.repository';
import { WhatsAppSessionEntity } from 'src/domain/entities/whatsapp-session.entity';
import { UUID } from 'src/domain/entities/vos';
import { PrismaService } from '../prisma.service';

@Injectable()
export class WhatsAppSessionRepository implements IWhatsAppSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<WhatsAppSessionEntity | null> {
    const record = await this.prisma.whatsapp_sessions.findUnique({
      where: { userId },
    });
    if (!record) return null;

    return new WhatsAppSessionEntity({
      id: UUID.from(record.id),
      userId: UUID.from(record.userId),
      creds: record.creds,
      keys: record.keys,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async save(session: WhatsAppSessionEntity): Promise<void> {
    await this.prisma.whatsapp_sessions.upsert({
      where: { userId: session.userId.toString() },
      create: {
        id: session.id.toString(),
        userId: session.userId.toString(),
        creds: session.creds,
        keys: session.keys,
      },
      update: {
        creds: session.creds,
        keys: session.keys,
      },
    });
  }

  async delete(userId: string): Promise<void> {
    await this.prisma.whatsapp_sessions.deleteMany({ where: { userId } });
  }

  async findAllUserIds(): Promise<string[]> {
    const records = await this.prisma.whatsapp_sessions.findMany({
      select: { userId: true },
    });
    return records.map((r) => r.userId);
  }

  async setConnectionStatus(
    userId: string,
    status: WhatsappConnectionStatus,
    connectedPhone: string | null,
  ): Promise<void> {
    await this.prisma.whatsapp_sessions.update({
      where: { userId },
      data: {
        connectionStatus: status,
        connectedPhone,
        lastSeenAt: new Date(),
      },
    });
  }

  async markAllDisconnected(): Promise<void> {
    await this.prisma.whatsapp_sessions.updateMany({
      data: {
        connectionStatus: 'DISCONNECTED',
        connectedPhone: null,
      },
    });
  }

  async getConnectionInfo(
    userId: string,
  ): Promise<WhatsappConnectionInfo | null> {
    const record = await this.prisma.whatsapp_sessions.findUnique({
      where: { userId },
      select: {
        connectionStatus: true,
        connectedPhone: true,
        lastSeenAt: true,
      },
    });
    if (!record) return null;
    return {
      status: record.connectionStatus as WhatsappConnectionStatus,
      connectedPhone: record.connectedPhone,
      lastSeenAt: record.lastSeenAt,
    };
  }
}
