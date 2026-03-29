import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateKanbanUseCase } from './update-kanban.use-case';
import { IKanbanRepository, IUserRepository } from 'src/domain/repositories';
import { KanbanEntity } from 'src/domain/entities/kanban.entity';
import { UserEntity } from 'src/domain/entities/user.entity';
import { Password } from 'src/domain/entities/vos';

vi.mock('bcrypt', () => ({
  hashSync: vi.fn(() => 'hashed'),
  compareSync: vi.fn(() => true),
}));

const makeUser = () =>
  new UserEntity({ name: 'Ana', email: 'ana@test.com', phone: '5511999999999', password: Password.fromHash('hashed') });

const makeKanban = (userId: string) =>
  new KanbanEntity({ userId, title: 'Old', description: 'Old desc' });

describe('UpdateKanbanUseCase', () => {
  let kanbanRepository: IKanbanRepository;
  let userRepository: IUserRepository;
  let useCase: UpdateKanbanUseCase;

  beforeEach(() => {
    kanbanRepository = { get: vi.fn(), update: vi.fn() } as unknown as IKanbanRepository;
    userRepository = { get: vi.fn() } as unknown as IUserRepository;
    useCase = new UpdateKanbanUseCase(kanbanRepository, userRepository);
  });

  it('should throw if user not found', async () => {
    vi.mocked(userRepository.get).mockResolvedValue(null);
    await expect(useCase.execute({ id: 'k-1', userId: 'u-1', title: 'T', description: 'D', imageUrl: null })).rejects.toThrow('User not found');
  });

  it('should throw if kanban not found', async () => {
    vi.mocked(userRepository.get).mockResolvedValue(makeUser());
    vi.mocked(kanbanRepository.get).mockResolvedValue(null);
    await expect(useCase.execute({ id: 'k-1', userId: 'u-1', title: 'T', description: 'D', imageUrl: null })).rejects.toThrow('Kanban not found');
  });

  it('should throw if user does not own the kanban', async () => {
    const user = makeUser();
    const kanban = makeKanban('other-user');
    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(kanbanRepository.get).mockResolvedValue(kanban);
    await expect(useCase.execute({ id: kanban.id.toString(), userId: user.id.toString(), title: 'T', description: 'D', imageUrl: null })).rejects.toThrow('User does not own this kanban');
  });

  it('should update and return the kanban', async () => {
    const user = makeUser();
    const kanban = makeKanban(user.id.toString());
    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(kanbanRepository.get).mockResolvedValue(kanban);
    vi.mocked(kanbanRepository.update).mockResolvedValue();

    const result = await useCase.execute({ id: kanban.id.toString(), userId: user.id.toString(), title: 'New Title', description: 'New Desc', imageUrl: null });

    expect(kanbanRepository.update).toHaveBeenCalledOnce();
    expect(result.title).toBe('New Title');
    expect(result.description).toBe('New Desc');
  });
});
