import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DuplicateKanbanController } from './duplicate-kanban.controller';
import { DuplicateKanbanUseCase } from 'src/domain/use-cases';
import { KanbanEntity } from 'src/domain/entities/kanban.entity';
import { UUID } from 'src/domain/entities/vos';

const makeKanban = () =>
  new KanbanEntity({
    userId: UUID.generate().toString(),
    title: 'K',
    description: 'D',
    imageUrl: 'img.png',
  });

describe('DuplicateKanbanController', () => {
  let duplicateKanbanUseCase: DuplicateKanbanUseCase;
  let controller: DuplicateKanbanController;

  beforeEach(() => {
    duplicateKanbanUseCase = {
      execute: vi.fn(),
    } as unknown as DuplicateKanbanUseCase;
    controller = new DuplicateKanbanController(duplicateKanbanUseCase);
  });

  it('should call use case and return formatted kanban', async () => {
    const kanban = makeKanban();
    vi.mocked(duplicateKanbanUseCase.execute).mockResolvedValue(kanban);

    const req = { user: { id: 'u-1' } } as any;
    const result = await controller.handle({ kanbanId: 'k-1' }, req);

    expect(duplicateKanbanUseCase.execute).toHaveBeenCalledWith({
      kanbanId: 'k-1',
      userId: 'u-1',
    });
    expect(result).toEqual({
      id: kanban.id.toString(),
      title: kanban.title,
      description: kanban.description,
      imageUrl: kanban.imageUrl,
    });
  });

  it('should propagate errors from the use case', async () => {
    vi.mocked(duplicateKanbanUseCase.execute).mockRejectedValue(
      new Error('Kanban not found'),
    );
    await expect(
      controller.handle({ kanbanId: 'k-1' }, { user: { id: 'u-1' } } as any),
    ).rejects.toThrow('Kanban not found');
  });
});
