import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetKanbanController } from './get-kanban.controller';
import { GetKanbanUseCase } from 'src/domain/use-cases';
import { UUID } from 'src/domain/entities/vos';
import { KanbanDetails } from 'src/domain/entities/kanban.entity';

const makeDetails = (userId: string): KanbanDetails => ({
  id: UUID.generate().toString(),
  userId,
  title: 'K',
  description: 'D',
  imageUrl: null,
  phoneNumber: null,
  isActive: false,
  stages: [],
});

describe('GetKanbanController', () => {
  let getKanbanUseCase: GetKanbanUseCase;
  let controller: GetKanbanController;

  beforeEach(() => {
    getKanbanUseCase = { execute: vi.fn() } as unknown as GetKanbanUseCase;
    controller = new GetKanbanController(getKanbanUseCase);
  });

  it('should call use case and return result', async () => {
    const details = makeDetails('u-1');
    vi.mocked(getKanbanUseCase.execute).mockResolvedValue(details);

    const req = { user: { id: 'u-1' } } as any;
    const result = await controller.getKanban({ id: details.id }, req);

    expect(getKanbanUseCase.execute).toHaveBeenCalledWith({
      id: details.id,
      userId: 'u-1',
    });
    expect(result).toEqual(details);
  });

  it('should propagate errors from the use case', async () => {
    vi.mocked(getKanbanUseCase.execute).mockRejectedValue(
      new Error('Kanban not found'),
    );
    await expect(
      controller.getKanban({ id: 'k-1' }, { user: { id: 'u-1' } } as any),
    ).rejects.toThrow('Kanban not found');
  });
});
