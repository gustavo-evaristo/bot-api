export interface AnalyticsResult {
  messagesReceivedToday: number;
  newLeadsToday: number;
  totalLeads: number;
  totalInteractions: number;
  leadsByDate: { date: string; count: number }[];
  messagesByDay: { date: string; count: number }[];
  conversationStatus: { status: string; count: number }[];
  leadsByFlow: { flow: string; count: number }[];
  messagesByHour: { hour: number; count: number }[];
}

export abstract class IAnalyticsRepository {
  abstract getAnalytics(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AnalyticsResult>;
}
