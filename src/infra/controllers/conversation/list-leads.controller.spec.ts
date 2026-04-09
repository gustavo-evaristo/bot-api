import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListLeadsController } from './list-leads.controller';
import { ListLeadsUseCase } from 'src/domain/use-cases/conversation/list-leads.use-case';

describe('ListLeadsController', () => {
  let listLeadsUseCase: ListLeadsUseCase;
  let controller: ListLeadsController;

  beforeEach(() => {
    listLeadsUseCase = { execute: vi.fn() } as unknown as ListLeadsUseCase;
    controller = new ListLeadsController(listLeadsUseCase);
  });

  it('should call use case with userId from request and return result', async () => {
    const output = {
      leads: [
        {
          id: 'c-1',
          leadPhoneNumber: '+5511999999999',
          leadName: 'Maria Silva',
          status: 'FINISHED',
          createdAt: new Date('2026-04-01T10:00:00Z'),
        },
      ],
    };
    vi.mocked(listLeadsUseCase.execute).mockResolvedValue(output);

    const req = { user: { id: 'u-1' } } as any;
    const result = await controller.listLeads(req);

    expect(listLeadsUseCase.execute).toHaveBeenCalledWith({ userId: 'u-1' });
    expect(result).toEqual(output);
  });

  it('should return empty leads array when user has no leads', async () => {
    vi.mocked(listLeadsUseCase.execute).mockResolvedValue({ leads: [] });

    const result = await controller.listLeads({ user: { id: 'u-1' } } as any);

    expect(result.leads).toEqual([]);
  });

  it('should handle leads with null leadName', async () => {
    const output = {
      leads: [
        {
          id: 'c-2',
          leadPhoneNumber: '+5511888888888',
          leadName: null,
          status: 'ACTIVE',
          createdAt: new Date('2026-04-07T08:00:00Z'),
        },
      ],
    };
    vi.mocked(listLeadsUseCase.execute).mockResolvedValue(output);

    const result = await controller.listLeads({ user: { id: 'u-2' } } as any);

    expect(result.leads[0].leadName).toBeNull();
  });
});
