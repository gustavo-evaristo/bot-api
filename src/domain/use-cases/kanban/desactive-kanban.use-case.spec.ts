import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DesactiveKanbanUseCase } from './desactive-kanban.use-case';
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
  new KanbanEntity({ userId, title: 'K', description: 'D', phoneNumber: '5511999999999', isActive: true });

describe('DesactiveKanbanUseCase', () => {
  let kanbanRepository: IKanbanRepository;
  let userRepository: IUserRepository;
  let useCase: DesactiveKanbanUseCase;

  beforeEach(() => {
    kanbanRepository = { get: vi.fn(), update: vi.fn() } as unknown as IKanbanRepository;
    userRepository = { get: vi.fn() } as unknown as IUserRepository;
    useCase = new DesactiveKanbanUseCase(kanbanRepository, userRepository);
  });

  it('should throw if user not found', async () => {
    vi.mocked(userRepository.get).mockResolvedValue(null);
    await expect(useCase.execute({ id: 'k-1', userId: 'u-1' })).rejects.toThrow('User not found');
  });

  it('should throw if kanban not found', async () => {
    vi.mocked(userRepository.get).mockResolvedValue(makeUser());
    vi.mocked(kanbanRepository.get).mockResolvedValue(null);
    await expect(useCase.execute({ id: 'k-1', userId: 'u-1' })).rejects.toThrow('Kanban not found');
  });

  it('should throw if user does not own the kanban', async () => {
    const user = makeUser();
    const kanban = makeKanban('other-user');
    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(kanbanRepository.get).mockResolvedValue(kanban);
    await expect(useCase.execute({ id: kanban.id.toString(), userId: user.id.toString() })).rejects.toThrow('User does not own this kanban');
  });

  it('should deactivate the kanban', async () => {
    const user = makeUser();
    const kanban = makeKanban(user.id.toString());
    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(kanbanRepository.get).mockResolvedValue(kanban);
    vi.mocked(kanbanRepository.update).mockResolvedValue();

    const result = await useCase.execute({ id: kanban.id.toString(), userId: user.id.toString() });

    expect(result.isActive).toBe(false);
    expect(kanbanRepository.update).toHaveBeenCalledOnce();
  });
});
