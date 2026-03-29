import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListKanbansController } from './list-kanbans.controller';
import { ListKanbansUseCase } from 'src/domain/use-cases/kanban/list-kanbans.use-case';
import { KanbanEntity } from 'src/domain/entities/kanban.entity';
import { UUID } from 'src/domain/entities/vos';

const makeKanban = () =>
  new KanbanEntity({ userId: UUID.generate().toString(), title: 'K', description: 'D' });

describe('ListKanbansController', () => {
  let listKanbansUseCase: ListKanbansUseCase;
  let controller: ListKanbansController;

  beforeEach(() => {
    listKanbansUseCase = { execute: vi.fn() } as unknown as ListKanbansUseCase;
    controller = new ListKanbansController(listKanbansUseCase);
  });

  it('should return mapped kanban list', async () => {
    const kanbans = [makeKanban(), makeKanban()];
    vi.mocked(listKanbansUseCase.execute).mockResolvedValue(kanbans);

    const req = { user: { id: 'u-1' } } as any;
    const result = await controller.listKanbans(req);

    expect(listKanbansUseCase.execute).toHaveBeenCalledWith('u-1');
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: kanbans[0].id.toString(),
      title: kanbans[0].title,
      description: kanbans[0].description,
    });
  });

  it('should return empty array when no kanbans', async () => {
    vi.mocked(listKanbansUseCase.execute).mockResolvedValue([]);
    const result = await controller.listKanbans({ user: { id: 'u-1' } } as any);
    expect(result).toEqual([]);
  });
});
