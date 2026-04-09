export interface AnalyticsResult {
  totalLeads: number;
  totalInteractions: number;
  leadsByDayOfWeek: { day: string; count: number }[];
}

export abstract class IAnalyticsRepository {
  abstract getAnalytics(
    userId: string,
    weekStart: Date,
    weekEnd: Date,
  ): Promise<AnalyticsResult>;
}
