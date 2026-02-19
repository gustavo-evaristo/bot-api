import { UserEntity } from '../entities/user.entity';

export interface FindByEmailOrPhoneInput {
  email: string;
  phone: string;
}

export abstract class IUserRepository {
  abstract get(id: string): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findByEmailOrPhone(
    input: FindByEmailOrPhoneInput,
  ): Promise<UserEntity | null>;
  abstract create(user: UserEntity): Promise<void>;
}
