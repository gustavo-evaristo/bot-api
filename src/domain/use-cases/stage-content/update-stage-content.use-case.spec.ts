import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateStageContentUseCase } from './update-stage-content.use-case';
import {
  IAnswerRepository,
  IStageContentRepository,
  IUserRepository,
} from 'src/domain/repositories';
import {
  StageContentEntity,
  ContentType,
} from 'src/domain/entities/stage-content.entity';
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

const makeContent = (type: ContentType = ContentType.TEXT) =>
  new StageContentEntity({ stageId: 's-1', content: 'Old', contentType: type });

describe('UpdateStageContentUseCase', () => {
  let userRepository: IUserRepository;
  let stageContentRepository: IStageContentRepository;
  let answerRepository: IAnswerRepository;
  let useCase: UpdateStageContentUseCase;

  beforeEach(() => {
    userRepository = { get: vi.fn() } as unknown as IUserRepository;
    stageContentRepository = {
      get: vi.fn(),
      save: vi.fn(),
    } as unknown as IStageContentRepository;
    answerRepository = {
      deleteByStageContentId: vi.fn(),
      createMany: vi.fn(),
    } as unknown as IAnswerRepository;
    useCase = new UpdateStageContentUseCase(
      stageContentRepository,
      userRepository,
      answerRepository,
    );
  });

  it('should throw if user not found', async () => {
    vi.mocked(userRepository.get).mockResolvedValue(null);
    await expect(
      useCase.execute({
        userId: 'u-1',
        stageContentId: 'sc-1',
        content: 'C',
        contentType: ContentType.TEXT,
      }),
    ).rejects.toThrow('User not found');
  });

  it('should throw if stage content not found', async () => {
    vi.mocked(userRepository.get).mockResolvedValue(makeUser());
    vi.mocked(stageContentRepository.get).mockResolvedValue(null);
    await expect(
      useCase.execute({
        userId: 'u-1',
        stageContentId: 'sc-1',
        content: 'C',
        contentType: ContentType.TEXT,
      }),
    ).rejects.toThrow('Stage content not found');
  });

  it('should update text content', async () => {
    const user = makeUser();
    const content = makeContent();
    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(stageContentRepository.get).mockResolvedValue(content);
    vi.mocked(stageContentRepository.save).mockResolvedValue();

    await useCase.execute({
      userId: user.id.toString(),
      stageContentId: content.id.toString(),
      content: 'New content',
      contentType: ContentType.TEXT,
    });

    expect(content.content).toBe('New content');
    expect(stageContentRepository.save).toHaveBeenCalledOnce();
    expect(answerRepository.deleteByStageContentId).not.toHaveBeenCalled();
  });

  it('should replace answers when updating multiple choice', async () => {
    const user = makeUser();
    const content = makeContent(ContentType.MULTIPLE_CHOICE);
    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(stageContentRepository.get).mockResolvedValue(content);
    vi.mocked(stageContentRepository.save).mockResolvedValue();
    vi.mocked(answerRepository.deleteByStageContentId).mockResolvedValue();
    vi.mocked(answerRepository.createMany).mockResolvedValue();

    await useCase.execute({
      userId: user.id.toString(),
      stageContentId: content.id.toString(),
      content: 'Q?',
      contentType: ContentType.MULTIPLE_CHOICE,
      answers: [{ content: 'Sim', score: 1 }],
    });

    expect(answerRepository.deleteByStageContentId).toHaveBeenCalledWith(
      content.id.toString(),
    );
    expect(answerRepository.createMany).toHaveBeenCalledOnce();
  });
});
