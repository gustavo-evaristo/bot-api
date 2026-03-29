import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetKanbanUseCase } from './get-kanban.use-case';
import { IKanbanRepository, IUserRepository } from 'src/domain/repositories';
import { UserEntity } from 'src/domain/entities/user.entity';
import { Password, UUID } from 'src/domain/entities/vos';
import { KanbanDetails } from 'src/domain/entities/kanban.entity';

vi.mock('bcrypt', () => ({
  hashSync: vi.fn(() => 'hashed'),
  compareSync: vi.fn(() => true),
}));

const makeUser = () =>
  new UserEntity({ name: 'Ana', email: 'ana@test.com', phone: '5511999999999', password: Password.fromHash('hashed') });

const makeDetails = (userId: string): KanbanDetails => ({
  id: UUID.generate().toString(),
  userId,
  title: 'K',
  description: 'D',
  imageUrl: null,
  phoneNumber: null,
  isActive: false,
  stages: [],
});

describe('GetKanbanUseCase', () => {
  let kanbanRepository: IKanbanRepository;
  let userRepository: IUserRepository;
  let useCase: GetKanbanUseCase;

  beforeEach(() => {
    kanbanRepository = { getDetails: vi.fn() } as unknown as IKanbanRepository;
    userRepository = { get: vi.fn() } as unknown as IUserRepository;
    useCase = new GetKanbanUseCase(userRepository, kanbanRepository);
  });

  it('should throw if user not found', async () => {
    vi.mocked(userRepository.get).mockResolvedValue(null);
    await expect(useCase.execute({ id: 'k-1', userId: 'u-1' })).rejects.toThrow('User not found');
  });

  it('should throw if kanban not found', async () => {
    const user = makeUser();
    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(kanbanRepository.getDetails).mockResolvedValue(null);
    await expect(useCase.execute({ id: 'k-1', userId: user.id.toString() })).rejects.toThrow('Kanban not found');
  });

  it('should throw if user does not own the kanban', async () => {
    const user = makeUser();
    const details = makeDetails('other-user-id');
    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(kanbanRepository.getDetails).mockResolvedValue(details);
    await expect(useCase.execute({ id: details.id, userId: user.id.toString() })).rejects.toThrow('User does not own this kanban');
  });

  it('should return kanban details when user owns it', async () => {
    const user = makeUser();
    const details = makeDetails(user.id.toString());
    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(kanbanRepository.getDetails).mockResolvedValue(details);

    const result = await useCase.execute({ id: details.id, userId: user.id.toString() });
    expect(result).toEqual(details);
  });
});
