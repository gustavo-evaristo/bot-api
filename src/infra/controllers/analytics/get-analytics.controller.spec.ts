import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetAnalyticsController } from './get-analytics.controller';
import { GetAnalyticsUseCase } from 'src/domain/use-cases/analytics/get-analytics.use-case';

describe('GetAnalyticsController', () => {
  let getAnalyticsUseCase: GetAnalyticsUseCase;
  let controller: GetAnalyticsController;

  const mockAnalytics = {
    totalLeads: 120,
    totalInteractions: 350,
    leadsByDayOfWeek: [
      { day: 'Monday', count: 10 },
      { day: 'Tuesday', count: 5 },
      { day: 'Wednesday', count: 20 },
      { day: 'Thursday', count: 5 },
      { day: 'Friday', count: 10 },
      { day: 'Saturday', count: 2 },
      { day: 'Sunday', count: 0 },
    ],
  };

  beforeEach(() => {
    getAnalyticsUseCase = { execute: vi.fn() } as unknown as GetAnalyticsUseCase;
    controller = new GetAnalyticsController(getAnalyticsUseCase);
  });

  it('should call use case with userId from request and return result', async () => {
    vi.mocked(getAnalyticsUseCase.execute).mockResolvedValue(mockAnalytics);

    const req = { user: { id: 'u-1' } } as any;
    const result = await controller.getAnalytics(req);

    expect(getAnalyticsUseCase.execute).toHaveBeenCalledWith({ userId: 'u-1' });
    expect(result).toEqual(mockAnalytics);
  });

  it('should return correct shape with all 7 days', async () => {
    vi.mocked(getAnalyticsUseCase.execute).mockResolvedValue(mockAnalytics);

    const result = await controller.getAnalytics({ user: { id: 'u-1' } } as any);

    expect(result.leadsByDayOfWeek).toHaveLength(7);
    expect(result.totalLeads).toBe(120);
    expect(result.totalInteractions).toBe(350);
  });

  it('should return zeros when user has no data', async () => {
    const emptyResult = {
      totalLeads: 0,
      totalInteractions: 0,
      leadsByDayOfWeek: [
        { day: 'Monday', count: 0 },
        { day: 'Tuesday', count: 0 },
        { day: 'Wednesday', count: 0 },
        { day: 'Thursday', count: 0 },
        { day: 'Friday', count: 0 },
        { day: 'Saturday', count: 0 },
        { day: 'Sunday', count: 0 },
      ],
    };
    vi.mocked(getAnalyticsUseCase.execute).mockResolvedValue(emptyResult);

    const result = await controller.getAnalytics({ user: { id: 'u-2' } } as any);

    expect(result.totalLeads).toBe(0);
    expect(result.totalInteractions).toBe(0);
    expect(result.leadsByDayOfWeek.every((d) => d.count === 0)).toBe(true);
  });
});
