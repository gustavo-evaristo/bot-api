import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateStageContentUseCase } from './create-stage.content.use-case';
import {
  IAnswerRepository,
  IStageContentRepository,
  IStageRepository,
  IUserRepository,
} from 'src/domain/repositories';
import { StageEntity } from 'src/domain/entities/stage.entity';
import { UserEntity } from 'src/domain/entities/user.entity';
import { ContentType } from 'src/domain/entities/stage-content.entity';
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

const makeStage = () =>
  new StageEntity({ kanbanId: 'k-1', title: 'S', description: 'D' });

describe('CreateStageContentUseCase', () => {
  let userRepository: IUserRepository;
  let stageRepository: IStageRepository;
  let stageContentRepository: IStageContentRepository;
  let answerRepository: IAnswerRepository;
  let useCase: CreateStageContentUseCase;

  beforeEach(() => {
    userRepository = { get: vi.fn() } as unknown as IUserRepository;
    stageRepository = { get: vi.fn() } as unknown as IStageRepository;
    stageContentRepository = {
      create: vi.fn(),
    } as unknown as IStageContentRepository;
    answerRepository = { createMany: vi.fn() } as unknown as IAnswerRepository;
    useCase = new CreateStageContentUseCase(
      userRepository,
      stageRepository,
      stageContentRepository,
      answerRepository,
    );
  });

  it('should throw if user not found', async () => {
    vi.mocked(userRepository.get).mockResolvedValue(null);
    await expect(
      useCase.execute({
        userId: 'u-1',
        stageId: 's-1',
        content: 'C',
        contentType: ContentType.TEXT,
      }),
    ).rejects.toThrow('User not found');
  });

  it('should throw if stage not found', async () => {
    vi.mocked(userRepository.get).mockResolvedValue(makeUser());
    vi.mocked(stageRepository.get).mockResolvedValue(null);
    await expect(
      useCase.execute({
        userId: 'u-1',
        stageId: 's-1',
        content: 'C',
        contentType: ContentType.TEXT,
      }),
    ).rejects.toThrow('Stage not found');
  });

  it('should create text content without answers', async () => {
    const user = makeUser();
    const stage = makeStage();
    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(stageRepository.get).mockResolvedValue(stage);
    vi.mocked(stageContentRepository.create).mockResolvedValue();

    await useCase.execute({
      userId: user.id.toString(),
      stageId: stage.id.toString(),
      content: 'Hello',
      contentType: ContentType.TEXT,
    });

    expect(stageContentRepository.create).toHaveBeenCalledOnce();
    expect(answerRepository.createMany).not.toHaveBeenCalled();
  });

  it('should create multiple choice content with answers', async () => {
    const user = makeUser();
    const stage = makeStage();
    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(stageRepository.get).mockResolvedValue(stage);
    vi.mocked(stageContentRepository.create).mockResolvedValue();
    vi.mocked(answerRepository.createMany).mockResolvedValue();

    await useCase.execute({
      userId: user.id.toString(),
      stageId: stage.id.toString(),
      content: 'Qual opção?',
      contentType: ContentType.MULTIPLE_CHOICE,
      answers: [
        { content: 'Sim', score: 1 },
        { content: 'Não', score: 0 },
      ],
    });

    expect(stageContentRepository.create).toHaveBeenCalledOnce();
    expect(answerRepository.createMany).toHaveBeenCalledOnce();
  });

  it('should not call createMany if no answers provided for multiple choice', async () => {
    const user = makeUser();
    const stage = makeStage();
    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(stageRepository.get).mockResolvedValue(stage);
    vi.mocked(stageContentRepository.create).mockResolvedValue();

    await useCase.execute({
      userId: user.id.toString(),
      stageId: stage.id.toString(),
      content: 'Q',
      contentType: ContentType.MULTIPLE_CHOICE,
    });

    expect(answerRepository.createMany).not.toHaveBeenCalled();
  });
});
