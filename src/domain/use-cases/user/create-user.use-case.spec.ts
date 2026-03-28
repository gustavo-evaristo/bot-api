import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateUserUseCase } from './create-user.use-case';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';

vi.mock('bcrypt', () => ({
  hashSync: vi.fn(() => 'hashed_password'),
  compareSync: vi.fn(() => true),
}));

const makeRepos = () => {
  const userRepository: IUserRepository = {
    get: vi.fn(),
    findByEmail: vi.fn(),
    findByEmailOrPhone: vi.fn(),
    create: vi.fn(),
  } as unknown as IUserRepository;

  const jwtService = { sign: vi.fn().mockReturnValue('jwt-token') } as unknown as JwtService;

  return { userRepository, jwtService };
};

const validInput = {
  name: 'John Doe',
  email: 'john@test.com',
  phone: '5511999999999',
  password: 'Password@123',
  confirmPassword: 'Password@123',
};

describe('CreateUserUseCase', () => {
  let userRepository: IUserRepository;
  let jwtService: JwtService;
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    ({ userRepository, jwtService } = makeRepos());
    useCase = new CreateUserUseCase(userRepository, jwtService);
  });

  it('should throw if user already exists', async () => {
    vi.mocked(userRepository.findByEmailOrPhone).mockResolvedValue({} as any);

    await expect(useCase.execute(validInput)).rejects.toThrow('User already exists');
  });

  it('should create user and return user + token', async () => {
    vi.mocked(userRepository.findByEmailOrPhone).mockResolvedValue(null);
    vi.mocked(userRepository.create).mockResolvedValue();

    const result = await useCase.execute(validInput);

    expect(userRepository.create).toHaveBeenCalledOnce();
    expect(jwtService.sign).toHaveBeenCalledOnce();
    expect(result.token).toBe('jwt-token');
    expect(result.user.name).toBe(validInput.name);
    expect(result.user.email).toBe(validInput.email);
  });

  it('should throw if passwords do not match', async () => {
    vi.mocked(userRepository.findByEmailOrPhone).mockResolvedValue(null);

    await expect(
      useCase.execute({ ...validInput, confirmPassword: 'Different@123' }),
    ).rejects.toThrow('Passwords do not match');
  });
});
