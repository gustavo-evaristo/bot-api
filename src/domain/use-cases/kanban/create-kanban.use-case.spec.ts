import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateKanbanUseCase } from './create-kanban.use-case';
import { IKanbanRepository } from 'src/domain/repositories/kanban.repository';
import { IUserRepository } from 'src/domain/repositories/user.repository';
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

describe('CreateKanbanUseCase', () => {
  let kanbanRepository: IKanbanRepository;
  let userRepository: IUserRepository;
  let useCase: CreateKanbanUseCase;

  beforeEach(() => {
    kanbanRepository = { create: vi.fn() } as unknown as IKanbanRepository;
    userRepository = { get: vi.fn() } as unknown as IUserRepository;
    useCase = new CreateKanbanUseCase(kanbanRepository, userRepository);
  });

  it('should throw if user does not exist', async () => {
    vi.mocked(userRepository.get).mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: 'user-1', title: 'T', description: 'D' }),
    ).rejects.toThrow('User not found');
  });

  it('should create and return the kanban', async () => {
    const user = makeUser();
    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(kanbanRepository.create).mockResolvedValue();

    const kanban = await useCase.execute({
      userId: user.id.toString(),
      title: 'My Kanban',
      description: 'Description',
    });

    expect(kanbanRepository.create).toHaveBeenCalledOnce();
    expect(kanban.title).toBe('My Kanban');
    expect(kanban.userId.toString()).toBe(user.id.toString());
  });
});
