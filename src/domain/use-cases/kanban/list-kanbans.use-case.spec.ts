import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListKanbansUseCase } from './list-kanbans.use-case';
import { IKanbanRepository, IUserRepository } from 'src/domain/repositories';
import { KanbanEntity } from 'src/domain/entities/kanban.entity';
import { UserEntity } from 'src/domain/entities/user.entity';
import { Password, UUID } from 'src/domain/entities/vos';

vi.mock('bcrypt', () => ({
  hashSync: vi.fn(() => 'hashed'),
  compareSync: vi.fn(() => true),
}));

const makeUser = () =>
  new UserEntity({ name: 'Ana', email: 'ana@test.com', phone: '5511999999999', password: Password.fromHash('hashed') });

const makeKanban = (userId: string) =>
  new KanbanEntity({ userId, title: 'K', description: 'D' });

describe('ListKanbansUseCase', () => {
  let kanbanRepository: IKanbanRepository;
  let userRepository: IUserRepository;
  let useCase: ListKanbansUseCase;

  beforeEach(() => {
    kanbanRepository = { findManyByUserId: vi.fn() } as unknown as IKanbanRepository;
    userRepository = { get: vi.fn() } as unknown as IUserRepository;
    useCase = new ListKanbansUseCase(kanbanRepository, userRepository);
  });

  it('should throw if user not found', async () => {
    vi.mocked(userRepository.get).mockResolvedValue(null);
    await expect(useCase.execute('user-1')).rejects.toThrow('User not found');
  });

  it('should return kanbans for the user', async () => {
    const user = makeUser();
    const kanbans = [makeKanban(user.id.toString()), makeKanban(user.id.toString())];
    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(kanbanRepository.findManyByUserId).mockResolvedValue(kanbans);

    const result = await useCase.execute(user.id.toString());

    expect(result).toEqual(kanbans);
    expect(kanbanRepository.findManyByUserId).toHaveBeenCalledWith(user.id.toString());
  });
});
