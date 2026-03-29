import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteKanbanController } from './delete-kanban.controller';
import { DeleteKanbanUseCase } from 'src/domain/use-cases';

describe('DeleteKanbanController', () => {
  let deleteKanbanUseCase: DeleteKanbanUseCase;
  let controller: DeleteKanbanController;

  beforeEach(() => {
    deleteKanbanUseCase = { execute: vi.fn() } as unknown as DeleteKanbanUseCase;
    controller = new DeleteKanbanController(deleteKanbanUseCase);
  });

  it('should call use case and return status ok', async () => {
    vi.mocked(deleteKanbanUseCase.execute).mockResolvedValue();

    const req = { user: { id: 'u-1' } } as any;
    const result = await controller.handle('k-1', req);

    expect(deleteKanbanUseCase.execute).toHaveBeenCalledWith({ kanbanId: 'k-1', userId: 'u-1' });
    expect(result).toEqual({ status: 'ok' });
  });

  it('should propagate errors from the use case', async () => {
    vi.mocked(deleteKanbanUseCase.execute).mockRejectedValue(new Error('Kanban not found'));
    await expect(controller.handle('k-1', { user: { id: 'u-1' } } as any)).rejects.toThrow('Kanban not found');
  });
});
