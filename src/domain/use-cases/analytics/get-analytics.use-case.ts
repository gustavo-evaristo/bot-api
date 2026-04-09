import { Injectable } from '@nestjs/common';
import { startOfWeek, endOfWeek } from 'date-fns';
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
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    return { weekStart, weekEnd };
  }
}
