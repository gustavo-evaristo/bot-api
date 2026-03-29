import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetProfileUseCase } from './get-profile.use-case';
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

describe('GetProfileUseCase', () => {
  let userRepository: IUserRepository;
  let useCase: GetProfileUseCase;

  beforeEach(() => {
    userRepository = { get: vi.fn() } as unknown as IUserRepository;
    useCase = new GetProfileUseCase(userRepository);
  });

  it('should throw if user not found', async () => {
    vi.mocked(userRepository.get).mockResolvedValue(null);
    await expect(useCase.execute('user-1')).rejects.toThrow('User not found');
  });

  it('should return the user', async () => {
    const user = makeUser();
    vi.mocked(userRepository.get).mockResolvedValue(user);
    const result = await useCase.execute(user.id.toString());
    expect(result).toBe(user);
    expect(userRepository.get).toHaveBeenCalledWith(user.id.toString());
  });
});
