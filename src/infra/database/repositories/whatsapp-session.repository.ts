import { Injectable } from '@nestjs/common';
import { IWhatsAppSessionRepository } from 'src/domain/repositories/whatsapp-session.repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class WhatsAppSessionRepository implements IWhatsAppSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<{ creds: string; keys: string } | null> {
    const record = await this.prisma.whatsapp_sessions.findUnique({ where: { userId } });
    if (!record) return null;
    return { creds: record.creds, keys: record.keys };
  }

  async save(userId: string, creds: string, keys: string): Promise<void> {
    await this.prisma.whatsapp_sessions.upsert({
      where: { userId },
      create: { userId, creds, keys },
      update: { creds, keys },
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
}
