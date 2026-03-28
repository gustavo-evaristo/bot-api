import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginController } from './login.controller';
import { LoginUseCase } from 'src/domain/use-cases/user/login.use-case';
import { UserEntity } from 'src/domain/entities/user.entity';
import { Password } from 'src/domain/entities/vos';

vi.mock('bcrypt', () => ({
  hashSync: vi.fn(() => 'hashed'),
  compareSync: vi.fn(() => true),
}));

const makeUser = () =>
  new UserEntity({
    name: 'Lucas',
    email: 'lucas@test.com',
    phone: '5511999999999',
    password: Password.fromHash('hashed'),
  });

describe('LoginController', () => {
  let loginUseCase: LoginUseCase;
  let controller: LoginController;

  beforeEach(() => {
    loginUseCase = { execute: vi.fn() } as unknown as LoginUseCase;
    controller = new LoginController(loginUseCase);
  });

  it('should call the use case and return formatted response', async () => {
    const user = makeUser();
    vi.mocked(loginUseCase.execute).mockResolvedValue({ user, token: 'jwt-token' });

    const result = await controller.login({
      email: 'lucas@test.com',
      password: 'Password@123',
    });

    expect(loginUseCase.execute).toHaveBeenCalledWith({
      email: 'lucas@test.com',
      password: 'Password@123',
    });

    expect(result).toEqual({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      token: 'jwt-token',
    });
  });

  it('should propagate errors from the use case', async () => {
    vi.mocked(loginUseCase.execute).mockRejectedValue(new Error('User not found'));

    await expect(
      controller.login({ email: 'x@x.com', password: 'Password@123' }),
    ).rejects.toThrow('User not found');
  });
});
