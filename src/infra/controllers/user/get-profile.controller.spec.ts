import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetProfileController } from './get-profile.controller';
import { GetProfileUseCase } from 'src/domain/use-cases';
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

describe('GetProfileController', () => {
  let getProfileUseCase: GetProfileUseCase;
  let controller: GetProfileController;

  beforeEach(() => {
    getProfileUseCase = { execute: vi.fn() } as unknown as GetProfileUseCase;
    controller = new GetProfileController(getProfileUseCase);
  });

  it('should return formatted user profile', async () => {
    const user = makeUser();
    vi.mocked(getProfileUseCase.execute).mockResolvedValue(user);

    const req = { user: { id: user.id.toString() } } as any;
    const result = await controller.getProfile(req);

    expect(getProfileUseCase.execute).toHaveBeenCalledWith(user.id.toString());
    expect(result).toEqual({
      id: user.id.toString(),
      isActive: user.isActive,
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
    });
  });

  it('should propagate errors from the use case', async () => {
    vi.mocked(getProfileUseCase.execute).mockRejectedValue(
      new Error('User not found'),
    );
    const req = { user: { id: 'u-1' } } as any;
    await expect(controller.getProfile(req)).rejects.toThrow('User not found');
  });
});
