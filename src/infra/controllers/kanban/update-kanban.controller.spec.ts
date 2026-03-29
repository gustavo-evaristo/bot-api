import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateKanbanController } from './update-kanban.controller';
import { UpdateKanbanUseCase } from 'src/domain/use-cases';

describe('UpdateKanbanController', () => {
  let updateKanbanUseCase: UpdateKanbanUseCase;
  let controller: UpdateKanbanController;

  beforeEach(() => {
    updateKanbanUseCase = { execute: vi.fn() } as unknown as UpdateKanbanUseCase;
    controller = new UpdateKanbanController(updateKanbanUseCase);
  });

  it('should call use case and return status ok', async () => {
    vi.mocked(updateKanbanUseCase.execute).mockResolvedValue(undefined as any);

    const req = { user: { id: 'u-1' } } as any;
    const result = await controller.updateKanban({ id: 'k-1', title: 'T', description: 'D', imageUrl: null }, req);

    expect(updateKanbanUseCase.execute).toHaveBeenCalledWith({ id: 'k-1', userId: 'u-1', title: 'T', description: 'D', imageUrl: null });
    expect(result).toEqual({ status: 'ok' });
  });

  it('should propagate errors from the use case', async () => {
    vi.mocked(updateKanbanUseCase.execute).mockRejectedValue(new Error('User not found'));
    await expect(
      controller.updateKanban({ id: 'k-1', title: 'T', description: 'D', imageUrl: null }, { user: { id: 'u-1' } } as any),
    ).rejects.toThrow('User not found');
  });
});
