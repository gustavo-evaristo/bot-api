import { Injectable } from '@nestjs/common';
import { Password } from '../entities/vos';
import { IUserRepository } from '../repositories/user.repository';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class LoginUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute({ email, password }): Promise<UserEntity> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error('User not found');
    }

    const passwordVO = Password.create(password);

    const isValidPassword = passwordVO.compareWithHash(user.password.value);

    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    return user;
  }
}
