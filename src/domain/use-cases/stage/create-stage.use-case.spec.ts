import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateStageUseCase } from './create-stage.use-case';
import {
  IKanbanRepository,
  IStageRepository,
  IUserRepository,
} from 'src/domain/repositories';
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

describe('CreateStageUseCase', () => {
  let userRepository: IUserRepository;
  let stageRepository: IStageRepository;
  let kanbanRepository: IKanbanRepository;
  let useCase: CreateStageUseCase;

  beforeEach(() => {
    userRepository = { get: vi.fn() } as unknown as IUserRepository;
    stageRepository = { create: vi.fn() } as unknown as IStageRepository;
    kanbanRepository = { get: vi.fn() } as unknown as IKanbanRepository;
    useCase = new CreateStageUseCase(
      userRepository,
      stageRepository,
      kanbanRepository,
    );
  });

  it('should throw if user not found', async () => {
    vi.mocked(userRepository.get).mockResolvedValue(null);
    await expect(
      useCase.execute({
        kanbanId: 'k-1',
        userId: 'u-1',
        title: 'T',
        description: 'D',
      }),
    ).rejects.toThrow('User not found');
  });

  it('should throw if kanban not found', async () => {
    vi.mocked(userRepository.get).mockResolvedValue(makeUser());
    vi.mocked(kanbanRepository.get).mockResolvedValue(null);
    await expect(
      useCase.execute({
        kanbanId: 'k-1',
        userId: 'u-1',
        title: 'T',
        description: 'D',
      }),
    ).rejects.toThrow('Kanban not found');
  });

  it('should create a stage', async () => {
    const user = makeUser();
    const kanban = makeKanban(user.id.toString());
    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(kanbanRepository.get).mockResolvedValue(kanban);
    vi.mocked(stageRepository.create).mockResolvedValue();

    await useCase.execute({
      kanbanId: kanban.id.toString(),
      userId: user.id.toString(),
      title: 'Stage 1',
      description: 'Desc',
    });

    expect(stageRepository.create).toHaveBeenCalledOnce();
  });
});
