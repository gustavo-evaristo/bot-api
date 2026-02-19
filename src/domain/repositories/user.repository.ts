import { UserEntity } from '../entities/user.entity';

export abstract class IUserRepository {
  abstract get(id: string): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findByEmailOrPhone(emailOrPhone: string): Promise<UserEntity | null>;
  abstract create(user: UserEntity): Promise<void>;
}
