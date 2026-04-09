import { Injectable } from '@nestjs/common';
import {
  AnalyticsResult,
  IAnalyticsRepository,
} from 'src/domain/repositories/analytics.repository';
import { PrismaService } from '../prisma.service';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

@Injectable()
export class AnalyticsRepository implements IAnalyticsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getAnalytics(
    userId: string,
    weekStart: Date,
    weekEnd: Date,
  ): Promise<AnalyticsResult> {
    type CountsRow = { totalLeads: bigint; totalInteractions: bigint };

    const [counts] = await this.prismaService.$queryRaw<CountsRow[]>`
      SELECT
        COUNT(DISTINCT c.id)::bigint AS "totalLeads",
        COUNT(mh.id) FILTER (WHERE mh.sender = 'BOT')::bigint AS "totalInteractions"
      FROM kanbans k
      JOIN conversations c ON c."kanbanId" = k.id
      LEFT JOIN message_history mh ON mh."conversationId" = c.id
      WHERE k."userId" = ${userId}
        AND k."isDeleted" = false
    `;

    type WeekRow = { dow: number; count: bigint };

    const weekRows = await this.prismaService.$queryRaw<WeekRow[]>`
      SELECT
        EXTRACT(ISODOW FROM c."createdAt")::int AS dow,
        COUNT(*)::bigint AS count
      FROM kanbans k
      JOIN conversations c ON c."kanbanId" = k.id
      WHERE k."userId" = ${userId}
        AND k."isDeleted" = false
        AND c."createdAt" >= ${weekStart}
        AND c."createdAt" <= ${weekEnd}
      GROUP BY dow
    `;

    const countByDow = new Map(weekRows.map((r) => [r.dow, Number(r.count)]));
    const leadsByDayOfWeek = DAYS_OF_WEEK.map((day, i) => ({
      day,
      count: countByDow.get(i + 1) ?? 0,
    }));

    return {
      totalLeads: Number(counts.totalLeads),
      totalInteractions: Number(counts.totalInteractions),
      leadsByDayOfWeek,
    };
  }
}
