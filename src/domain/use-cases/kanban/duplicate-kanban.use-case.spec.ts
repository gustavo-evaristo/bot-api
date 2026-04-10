import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DuplicateKanbanUseCase } from './duplicate-kanban.use-case';
import { IKanbanRepository } from 'src/domain/repositories/kanban.repository';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { KanbanEntity } from 'src/domain/entities/kanban.entity';
import { UserEntity } from 'src/domain/entities/user.entity';
import { Password, UUID } from 'src/domain/entities/vos';

vi.mock('bcrypt', () => ({
  hashSync: vi.fn(() => 'hashed'),
  compareSync: vi.fn(() => true),
}));

const makeUser = (id = UUID.generate()) => {
  const user = new UserEntity({
    name: 'Peter',
    email: 'peter@test.com',
    phone: '5511999999999',
    password: Password.fromHash('hashed'),
  });
  Object.defineProperty(user, 'id', { value: id });
  return user;
};

const makeKanban = (userId: UUID) =>
  new KanbanEntity({
    userId: userId.toString(),
    title: 'Original',
    description: 'Desc',
    phoneNumber: '5511999999999',
  });

describe('DuplicateKanbanUseCase', () => {
  let kanbanRepository: IKanbanRepository;
  let userRepository: IUserRepository;
  let useCase: DuplicateKanbanUseCase;

  beforeEach(() => {
    kanbanRepository = {
      get: vi.fn(),
      create: vi.fn(),
    } as unknown as IKanbanRepository;
    userRepository = { get: vi.fn() } as unknown as IUserRepository;
    useCase = new DuplicateKanbanUseCase(kanbanRepository, userRepository);
  });

  it('should throw if user is not found', async () => {
    vi.mocked(userRepository.get).mockResolvedValue(null);
    await expect(
      useCase.execute({ kanbanId: 'k1', userId: 'u1' }),
    ).rejects.toThrow('User not found');
  });

  it('should throw if kanban is not found', async () => {
    const userId = UUID.generate();
    vi.mocked(userRepository.get).mockResolvedValue(makeUser(userId));
    vi.mocked(kanbanRepository.get).mockResolvedValue(null);

    await expect(
      useCase.execute({ kanbanId: 'k1', userId: userId.toString() }),
    ).rejects.toThrow('Kanban not found');
  });

  it('should throw if user does not own the kanban', async () => {
    const userId = UUID.generate();
    const otherUserId = UUID.generate();
    vi.mocked(userRepository.get).mockResolvedValue(makeUser(userId));
    vi.mocked(kanbanRepository.get).mockResolvedValue(makeKanban(otherUserId));

    await expect(
      useCase.execute({ kanbanId: 'k1', userId: userId.toString() }),
    ).rejects.toThrow('User is not the owner of the kanban');
  });

  it('should create the duplicated kanban and return the original', async () => {
    const userId = UUID.generate();
    const user = makeUser(userId);
    const kanban = makeKanban(userId);

    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(kanbanRepository.get).mockResolvedValue(kanban);
    vi.mocked(kanbanRepository.create).mockResolvedValue();

    const result = await useCase.execute({
      kanbanId: kanban.id.toString(),
      userId: userId.toString(),
    });

    expect(kanbanRepository.create).toHaveBeenCalledOnce();
    expect(result.title).toBe(kanban.title);
  });
});
