import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { IUserRepository } from '../repositories/user.repository';

@Injectable()
export class GetProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
