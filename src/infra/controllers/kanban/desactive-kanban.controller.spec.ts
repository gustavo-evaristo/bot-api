import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DesactiveKanbanController } from './desactive-kanban.controller';
import { DesactiveKanbanUseCase } from 'src/domain/use-cases';

describe('DesactiveKanbanController', () => {
  let desactiveKanbanUseCase: DesactiveKanbanUseCase;
  let controller: DesactiveKanbanController;

  beforeEach(() => {
    desactiveKanbanUseCase = {
      execute: vi.fn(),
    } as unknown as DesactiveKanbanUseCase;
    controller = new DesactiveKanbanController(desactiveKanbanUseCase);
  });

  it('should call use case and return status ok', async () => {
    vi.mocked(desactiveKanbanUseCase.execute).mockResolvedValue(
      undefined as any,
    );

    const req = { user: { id: 'u-1' } } as any;
    const result = await controller.handle({ id: 'k-1' }, req);

    expect(desactiveKanbanUseCase.execute).toHaveBeenCalledWith({
      id: 'k-1',
      userId: 'u-1',
    });
    expect(result).toEqual({ status: 'ok' });
  });

  it('should propagate errors from the use case', async () => {
    vi.mocked(desactiveKanbanUseCase.execute).mockRejectedValue(
      new Error('Kanban not found'),
    );
    await expect(
      controller.handle({ id: 'k-1' }, { user: { id: 'u-1' } } as any),
    ).rejects.toThrow('Kanban not found');
  });
});
