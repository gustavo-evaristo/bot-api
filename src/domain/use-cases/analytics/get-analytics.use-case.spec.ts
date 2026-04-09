import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetAnalyticsUseCase } from './get-analytics.use-case';
import { IAnalyticsRepository } from 'src/domain/repositories/analytics.repository';

describe('GetAnalyticsUseCase', () => {
  let analyticsRepository: IAnalyticsRepository;
  let useCase: GetAnalyticsUseCase;

  beforeEach(() => {
    analyticsRepository = { getAnalytics: vi.fn() } as unknown as IAnalyticsRepository;
    useCase = new GetAnalyticsUseCase(analyticsRepository);
  });

  it('should call repository with userId and current week bounds', async () => {
    const analyticsResult = {
      totalLeads: 50,
      totalInteractions: 120,
      leadsByDayOfWeek: [
        { day: 'Monday', count: 10 },
        { day: 'Tuesday', count: 5 },
        { day: 'Wednesday', count: 20 },
        { day: 'Thursday', count: 5 },
        { day: 'Friday', count: 10 },
        { day: 'Saturday', count: 0 },
        { day: 'Sunday', count: 0 },
      ],
    };
    vi.mocked(analyticsRepository.getAnalytics).mockResolvedValue(analyticsResult);

    const result = await useCase.execute({ userId: 'u-1' });

    expect(analyticsRepository.getAnalytics).toHaveBeenCalledTimes(1);
    const [calledUserId, calledWeekStart, calledWeekEnd] =
      vi.mocked(analyticsRepository.getAnalytics).mock.calls[0];
    expect(calledUserId).toBe('u-1');
    expect(calledWeekStart).toBeInstanceOf(Date);
    expect(calledWeekEnd).toBeInstanceOf(Date);
    expect(calledWeekEnd.getTime()).toBeGreaterThan(calledWeekStart.getTime());
    expect(result).toEqual(analyticsResult);
  });

  it('should compute weekStart as Monday at 00:00:00 UTC', async () => {
    vi.mocked(analyticsRepository.getAnalytics).mockResolvedValue({
      totalLeads: 0,
      totalInteractions: 0,
      leadsByDayOfWeek: [],
    });

    await useCase.execute({ userId: 'u-1' });

    const [, weekStart] = vi.mocked(analyticsRepository.getAnalytics).mock.calls[0];
    expect(weekStart.getDay()).toBe(1); // 1 = Monday
    expect(weekStart.getHours()).toBe(0);
    expect(weekStart.getMinutes()).toBe(0);
    expect(weekStart.getSeconds()).toBe(0);
  });

  it('should compute weekEnd as Sunday at 23:59:59 UTC', async () => {
    vi.mocked(analyticsRepository.getAnalytics).mockResolvedValue({
      totalLeads: 0,
      totalInteractions: 0,
      leadsByDayOfWeek: [],
    });

    await useCase.execute({ userId: 'u-1' });

    const [, , weekEnd] = vi.mocked(analyticsRepository.getAnalytics).mock.calls[0];
    expect(weekEnd.getDay()).toBe(0); // 0 = Sunday
    expect(weekEnd.getHours()).toBe(23);
    expect(weekEnd.getMinutes()).toBe(59);
    expect(weekEnd.getSeconds()).toBe(59);
  });

  it('should span exactly 7 days', async () => {
    vi.mocked(analyticsRepository.getAnalytics).mockResolvedValue({
      totalLeads: 0,
      totalInteractions: 0,
      leadsByDayOfWeek: [],
    });

    await useCase.execute({ userId: 'u-1' });

    const [, weekStart, weekEnd] = vi.mocked(analyticsRepository.getAnalytics).mock.calls[0];
    const diffDays = (weekEnd.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24);
    expect(Math.round(diffDays)).toBe(7); // Mon 00:00:00 to Sun 23:59:59 ≈ 7 days
  });
});
