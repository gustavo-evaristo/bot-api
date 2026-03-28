import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActiveKanbanUseCase } from './active-kanban.use-case';
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
    name: 'Carlos',
    email: 'carlos@test.com',
    phone: '5511999999999',
    password: Password.fromHash('hashed'),
  });
  Object.defineProperty(user, 'id', { value: id });
  return user;
};

const makeKanban = (userId: UUID, phoneNumber: string | null = '5511999999999') =>
  new KanbanEntity({
    userId: userId.toString(),
    title: 'Kanban',
    description: 'Desc',
    phoneNumber,
  });

describe('ActiveKanbanUseCase', () => {
  let kanbanRepository: IKanbanRepository;
  let userRepository: IUserRepository;
  let useCase: ActiveKanbanUseCase;

  beforeEach(() => {
    kanbanRepository = { get: vi.fn(), update: vi.fn() } as unknown as IKanbanRepository;
    userRepository = { get: vi.fn() } as unknown as IUserRepository;
    useCase = new ActiveKanbanUseCase(kanbanRepository, userRepository);
  });

  it('should throw if user is not found', async () => {
    vi.mocked(userRepository.get).mockResolvedValue(null);

    await expect(useCase.execute({ id: 'k1', userId: 'u1' })).rejects.toThrow(
      'User not found',
    );
  });

  it('should throw if kanban is not found', async () => {
    const userId = UUID.generate();
    vi.mocked(userRepository.get).mockResolvedValue(makeUser(userId));
    vi.mocked(kanbanRepository.get).mockResolvedValue(null);

    await expect(useCase.execute({ id: 'k1', userId: userId.toString() })).rejects.toThrow(
      'Kanban not found',
    );
  });

  it('should throw if user does not own the kanban', async () => {
    const userId = UUID.generate();
    const otherUserId = UUID.generate();
    const user = makeUser(userId);
    const kanban = makeKanban(otherUserId);

    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(kanbanRepository.get).mockResolvedValue(kanban);

    await expect(
      useCase.execute({ id: kanban.id.toString(), userId: userId.toString() }),
    ).rejects.toThrow('User does not own this kanban');
  });

  it('should throw when activating a kanban without phoneNumber', async () => {
    const userId = UUID.generate();
    const user = makeUser(userId);
    const kanban = makeKanban(userId, null);

    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(kanbanRepository.get).mockResolvedValue(kanban);
    vi.mocked(kanbanRepository.update).mockResolvedValue();

    await expect(
      useCase.execute({ id: kanban.id.toString(), userId: userId.toString() }),
    ).rejects.toThrow('Phone number is required to activate the kanban');
  });

  it('should activate the kanban and persist it', async () => {
    const userId = UUID.generate();
    const user = makeUser(userId);
    const kanban = makeKanban(userId);

    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(kanbanRepository.get).mockResolvedValue(kanban);
    vi.mocked(kanbanRepository.update).mockResolvedValue();

    const result = await useCase.execute({
      id: kanban.id.toString(),
      userId: userId.toString(),
    });

    expect(result.isActive).toBe(true);
    expect(kanbanRepository.update).toHaveBeenCalledWith(kanban);
  });
});
