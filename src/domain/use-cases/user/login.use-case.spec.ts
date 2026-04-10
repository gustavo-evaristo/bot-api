import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as bcrypt from 'bcrypt';
import { LoginUseCase } from './login.use-case';
import { IUserRepository } from 'src/domain/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/domain/entities/user.entity';
import { Password } from 'src/domain/entities/vos';

vi.mock('bcrypt', () => ({
  hashSync: vi.fn(() => 'hashed_password'),
  compareSync: vi.fn(() => true),
}));

const makeUser = () =>
  new UserEntity({
    name: 'Mary',
    email: 'mary@test.com',
    phone: '5511999999999',
    password: Password.fromHash('hashed_password'),
  });

describe('LoginUseCase', () => {
  let userRepository: IUserRepository;
  let jwtService: JwtService;
  let useCase: LoginUseCase;

  beforeEach(() => {
    userRepository = {
      findByEmail: vi.fn(),
    } as unknown as IUserRepository;

    jwtService = {
      sign: vi.fn().mockReturnValue('jwt-token'),
    } as unknown as JwtService;
    useCase = new LoginUseCase(userRepository, jwtService);
  });

  it('should throw if user is not found', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'notfound@test.com', password: 'Password@123' }),
    ).rejects.toThrow('User not found');
  });

  it('should throw if password is invalid', async () => {
    vi.mocked(bcrypt.compareSync).mockReturnValue(false as any);
    vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser());

    await expect(
      useCase.execute({ email: 'mary@test.com', password: 'Wrong@Pass' }),
    ).rejects.toThrow('Invalid password');
  });

  it('should return user and token with valid credentials', async () => {
    vi.mocked(bcrypt.compareSync).mockReturnValue(true as any);

    const user = makeUser();
    vi.mocked(userRepository.findByEmail).mockResolvedValue(user);

    const result = await useCase.execute({
      email: 'mary@test.com',
      password: 'Password@123',
    });

    expect(result.user).toBe(user);
    expect(result.token).toBe('jwt-token');
    expect(jwtService.sign).toHaveBeenCalledWith({ id: user.id.toString() });
  });
});
