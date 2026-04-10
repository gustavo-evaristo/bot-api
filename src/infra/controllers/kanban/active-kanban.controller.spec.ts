import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActiveKanbanController } from './active-kanban.controller';
import { ActiveKanbanUseCase } from 'src/domain/use-cases';

describe('ActiveKanbanController', () => {
  let activeKanbanUseCase: ActiveKanbanUseCase;
  let controller: ActiveKanbanController;

  beforeEach(() => {
    activeKanbanUseCase = {
      execute: vi.fn(),
    } as unknown as ActiveKanbanUseCase;
    controller = new ActiveKanbanController(activeKanbanUseCase);
  });

  it('should call use case and return status ok', async () => {
    vi.mocked(activeKanbanUseCase.execute).mockResolvedValue(undefined as any);

    const req = { user: { id: 'u-1' } } as any;
    const result = await controller.handle({ id: 'k-1' }, req);

    expect(activeKanbanUseCase.execute).toHaveBeenCalledWith({
      id: 'k-1',
      userId: 'u-1',
    });
    expect(result).toEqual({ status: 'ok' });
  });

  it('should propagate errors from the use case', async () => {
    vi.mocked(activeKanbanUseCase.execute).mockRejectedValue(
      new Error('Phone number is required to activate the kanban'),
    );
    await expect(
      controller.handle({ id: 'k-1' }, { user: { id: 'u-1' } } as any),
    ).rejects.toThrow('Phone number is required');
  });
});
