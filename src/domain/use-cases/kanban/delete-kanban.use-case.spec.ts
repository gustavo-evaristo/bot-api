import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteKanbanUseCase } from './delete-kanban.use-case';
import { IKanbanRepository, IUserRepository } from 'src/domain/repositories';
import { KanbanEntity } from 'src/domain/entities/kanban.entity';
import { UserEntity } from 'src/domain/entities/user.entity';
import { Password } from 'src/domain/entities/vos';

vi.mock('bcrypt', () => ({
  hashSync: vi.fn(() => 'hashed'),
  compareSync: vi.fn(() => true),
}));

const makeUser = () =>
  new UserEntity({
    name: 'Ana',
    email: 'ana@test.com',
    phone: '5511999999999',
    password: Password.fromHash('hashed'),
  });

const makeKanban = (userId: string) =>
  new KanbanEntity({ userId, title: 'K', description: 'D' });

describe('DeleteKanbanUseCase', () => {
  let kanbanRepository: IKanbanRepository;
  let userRepository: IUserRepository;
  let useCase: DeleteKanbanUseCase;

  beforeEach(() => {
    kanbanRepository = {
      get: vi.fn(),
      update: vi.fn(),
    } as unknown as IKanbanRepository;
    userRepository = { get: vi.fn() } as unknown as IUserRepository;
    useCase = new DeleteKanbanUseCase(kanbanRepository, userRepository);
  });

  it('should throw if user not found', async () => {
    vi.mocked(userRepository.get).mockResolvedValue(null);
    await expect(
      useCase.execute({ kanbanId: 'k-1', userId: 'u-1' }),
    ).rejects.toThrow('User not found');
  });

  it('should throw if kanban not found', async () => {
    vi.mocked(userRepository.get).mockResolvedValue(makeUser());
    vi.mocked(kanbanRepository.get).mockResolvedValue(null);
    await expect(
      useCase.execute({ kanbanId: 'k-1', userId: 'u-1' }),
    ).rejects.toThrow('Kanban not found');
  });

  it('should throw if user is not the owner', async () => {
    const user = makeUser();
    const kanban = makeKanban('other-user');
    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(kanbanRepository.get).mockResolvedValue(kanban);
    await expect(
      useCase.execute({
        kanbanId: kanban.id.toString(),
        userId: user.id.toString(),
      }),
    ).rejects.toThrow('User is not the owner of the kanban');
  });

  it('should soft-delete the kanban', async () => {
    const user = makeUser();
    const kanban = makeKanban(user.id.toString());
    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(kanbanRepository.get).mockResolvedValue(kanban);
    vi.mocked(kanbanRepository.update).mockResolvedValue();

    await useCase.execute({
      kanbanId: kanban.id.toString(),
      userId: user.id.toString(),
    });

    expect(kanban.isDeleted).toBe(true);
    expect(kanbanRepository.update).toHaveBeenCalledOnce();
  });
});
