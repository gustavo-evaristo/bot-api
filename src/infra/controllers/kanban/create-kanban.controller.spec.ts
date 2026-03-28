import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateKanbanController } from './create-kanban.controller';
import { CreateKanbanUseCase } from 'src/domain/use-cases/kanban/create-kanban.use-case';
import { KanbanEntity } from 'src/domain/entities/kanban.entity';
import { UUID } from 'src/domain/entities/vos';

const makeKanban = () =>
  new KanbanEntity({
    userId: UUID.generate().toString(),
    title: 'Kanban A',
    description: 'Desc A',
  });

describe('CreateKanbanController', () => {
  let createKanbanUseCase: CreateKanbanUseCase;
  let controller: CreateKanbanController;

  beforeEach(() => {
    createKanbanUseCase = { execute: vi.fn() } as unknown as CreateKanbanUseCase;
    controller = new CreateKanbanController(createKanbanUseCase);
  });

  it('should call the use case with correct data and return formatted response', async () => {
    const kanban = makeKanban();
    vi.mocked(createKanbanUseCase.execute).mockResolvedValue(kanban);

    const req = { user: { id: kanban.userId.toString() } } as any;
    const result = await controller.createKanban(
      { title: 'Kanban A', description: 'Desc A' },
      req,
    );

    expect(createKanbanUseCase.execute).toHaveBeenCalledWith({
      title: 'Kanban A',
      description: 'Desc A',
      userId: kanban.userId.toString(),
    });

    expect(result).toEqual({
      id: kanban.id.toString(),
      title: kanban.title,
      description: kanban.description,
    });
  });

  it('should propagate errors from the use case', async () => {
    vi.mocked(createKanbanUseCase.execute).mockRejectedValue(new Error('User not found'));

    const req = { user: { id: 'user-1' } } as any;
    await expect(
      controller.createKanban({ title: 'T', description: 'D' }, req),
    ).rejects.toThrow('User not found');
  });
});
