import { Injectable } from '@nestjs/common';
import { IAnalyticsRepository } from 'src/domain/repositories/analytics.repository';

interface Input {
  userId: string;
}

@Injectable()
export class GetAnalyticsUseCase {
  constructor(private readonly analyticsRepository: IAnalyticsRepository) {}

  async execute({ userId }: Input) {
    const { weekStart, weekEnd } = this.getCurrentWeekBounds();
    return this.analyticsRepository.getAnalytics(userId, weekStart, weekEnd);
  }

  private getCurrentWeekBounds(): { weekStart: Date; weekEnd: Date } {
    const now = new Date();
    const offsetFromMonday = (now.getUTCDay() + 6) % 7;

    const weekStart = new Date(now);
    weekStart.setUTCHours(0, 0, 0, 0);
    weekStart.setUTCDate(now.getUTCDate() - offsetFromMonday);

    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
    weekEnd.setUTCHours(23, 59, 59, 999);

    return { weekStart, weekEnd };
  }
}
