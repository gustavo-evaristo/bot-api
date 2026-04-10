import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteStageContentUseCase } from './delete-stage-content.use-case';
import {
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

const makeContent = () =>
  new StageContentEntity({
    stageId: 's-1',
    content: 'C',
    contentType: ContentType.TEXT,
  });

describe('DeleteStageContentUseCase', () => {
  let userRepository: IUserRepository;
  let stageContentRepository: IStageContentRepository;
  let useCase: DeleteStageContentUseCase;

  beforeEach(() => {
    userRepository = { get: vi.fn() } as unknown as IUserRepository;
    stageContentRepository = {
      get: vi.fn(),
      save: vi.fn(),
    } as unknown as IStageContentRepository;
    useCase = new DeleteStageContentUseCase(
      stageContentRepository,
      userRepository,
    );
  });

  it('should throw if user not found', async () => {
    vi.mocked(userRepository.get).mockResolvedValue(null);
    await expect(
      useCase.execute({ userId: 'u-1', stageContentId: 'sc-1' }),
    ).rejects.toThrow('User not found');
  });

  it('should throw if stage content not found', async () => {
    vi.mocked(userRepository.get).mockResolvedValue(makeUser());
    vi.mocked(stageContentRepository.get).mockResolvedValue(null);
    await expect(
      useCase.execute({ userId: 'u-1', stageContentId: 'sc-1' }),
    ).rejects.toThrow('Stage content not found');
  });

  it('should soft-delete the stage content', async () => {
    const user = makeUser();
    const content = makeContent();
    vi.mocked(userRepository.get).mockResolvedValue(user);
    vi.mocked(stageContentRepository.get).mockResolvedValue(content);
    vi.mocked(stageContentRepository.save).mockResolvedValue();

    await useCase.execute({
      userId: user.id.toString(),
      stageContentId: content.id.toString(),
    });

    expect(content.isDeleted).toBe(true);
    expect(stageContentRepository.save).toHaveBeenCalledOnce();
  });
});
