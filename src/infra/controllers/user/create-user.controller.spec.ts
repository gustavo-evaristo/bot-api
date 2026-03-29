import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateUserController } from './create-user.controller';
import { CreateUserUseCase } from 'src/domain/use-cases/user/create-user.use-case';
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

describe('CreateUserController', () => {
  let createUserUseCase: CreateUserUseCase;
  let controller: CreateUserController;

  beforeEach(() => {
    createUserUseCase = { execute: vi.fn() } as unknown as CreateUserUseCase;
    controller = new CreateUserController(createUserUseCase);
  });

  it('should return formatted user with token', async () => {
    const user = makeUser();
    vi.mocked(createUserUseCase.execute).mockResolvedValue({ user, token: 'jwt-token' });

    const result = await controller.execute({
      name: 'Ana',
      email: 'ana@test.com',
      phone: '5511999999999',
      password: 'pass@123',
      confirmPassword: 'pass@123',
    });

    expect(result).toEqual({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      token: 'jwt-token',
    });
  });

  it('should propagate errors from the use case', async () => {
    vi.mocked(createUserUseCase.execute).mockRejectedValue(new Error('Email already in use'));
    await expect(
      controller.execute({ name: 'A', email: 'a@a.com', phone: '111', password: 'p', confirmPassword: 'p' }),
    ).rejects.toThrow('Email already in use');
  });
});
