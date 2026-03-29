import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteStageUseCase } from './delete-stage.use-case';
import {
  IKanbanRepository,
  IStageRepository,
  IUserRepository,
} from 'src/domain/repositories';
import { StageEntity } from 'src/domain/entities/stage.entity';
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

const makeStage = (kanbanId: string) =>
  new StageEntity({ kanbanId, title: 'S', description: 'D' });

describe('DeleteStageUseCase', () => {
  let userRepository: IUserRepository;
  let stageRepository: IStageRepository;
  let kanbanRepository: IKanbanRepository;
  let useCase: DeleteStageUseCase;

  beforeEach(() => {
    userRepository = { get: vi.fn() } as unknown as IUserRepository;
    stageRepository = { get: vi.fn(), save: vi.fn() } as unknown as IStageRepository;
    kanbanRepository = { get: vi.fn() } as unknown as IKanbanRepository;
    useCase = new DeleteStageUseCase(userRepository, stageRepository, kanbanRepository);
  });

  it('should throw if user not found', async () => {
    vi.mocked(userRepository.get).mockResolvedValue(null);
    await expect(useCase.execute({ stageId: 's-1', userId: 'u-1' })).rejects.toThrow('User not found');
  });

  it('should throw if stage not found', async () => {
    vi.mocked(userRepository.get).mockResolvedValue(makeUser());
    vi.mocked(stageRepository.get).mockResolvedValue(null);
    await expect(useCase.execute({ stageId: 's-1', userId: 'u-1' })).rejects.toThrow('Stage not found');
  });

  it('should throw if kanban not found', async () => {
    const user = makeUser();
    const stage = makeStage('k-1');
    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(stageRepository.get).mockResolvedValue(stage);
    vi.mocked(kanbanRepository.get).mockResolvedValue(null);
    await expect(useCase.execute({ stageId: stage.id.toString(), userId: user.id.toString() })).rejects.toThrow('Kanban not found');
  });

  it('should throw if user does not own the kanban', async () => {
    const user = makeUser();
    const kanban = makeKanban('other-user');
    const stage = makeStage(kanban.id.toString());
    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(stageRepository.get).mockResolvedValue(stage);
    vi.mocked(kanbanRepository.get).mockResolvedValue(kanban);
    await expect(useCase.execute({ stageId: stage.id.toString(), userId: user.id.toString() })).rejects.toThrow('User does not own this kanban');
  });

  it('should soft-delete the stage', async () => {
    const user = makeUser();
    const kanban = makeKanban(user.id.toString());
    const stage = makeStage(kanban.id.toString());
    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(stageRepository.get).mockResolvedValue(stage);
    vi.mocked(kanbanRepository.get).mockResolvedValue(kanban);
    vi.mocked(stageRepository.save).mockResolvedValue();

    await useCase.execute({ stageId: stage.id.toString(), userId: user.id.toString() });

    expect(stage.isDeleted).toBe(true);
    expect(stageRepository.save).toHaveBeenCalledOnce();
  });
});
