import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateStageController } from './create-stage.controller';
import { CreateStageUseCase } from 'src/domain/use-cases/stage/create-stage.use-case';

describe('CreateStageController', () => {
  let createStageUseCase: CreateStageUseCase;
  let controller: CreateStageController;

  beforeEach(() => {
    createStageUseCase = { execute: vi.fn() } as unknown as CreateStageUseCase;
    controller = new CreateStageController(createStageUseCase);
  });

  it('should call use case and return status ok', async () => {
    vi.mocked(createStageUseCase.execute).mockResolvedValue();

    const req = { user: { id: 'u-1' } } as any;
    const result = await controller.handle({ title: 'Stage 1', description: 'Desc', kanbanId: 'k-1' }, req);

    expect(createStageUseCase.execute).toHaveBeenCalledWith({ kanbanId: 'k-1', title: 'Stage 1', description: 'Desc', userId: 'u-1' });
    expect(result).toEqual({ status: 'ok' });
  });

  it('should propagate errors from the use case', async () => {
    vi.mocked(createStageUseCase.execute).mockRejectedValue(new Error('Kanban not found'));
    await expect(
      controller.handle({ title: 'S', description: 'D', kanbanId: 'k-1' }, { user: { id: 'u-1' } } as any),
    ).rejects.toThrow('Kanban not found');
  });
});
