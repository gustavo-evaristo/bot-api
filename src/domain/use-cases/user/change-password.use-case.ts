import { Injectable } from '@nestjs/common';
import { Password } from '../../entities/vos';
import { IUserRepository } from '../../repositories/user.repository';

interface Input {
  userId: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable()
export class ChangePasswordUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: Input): Promise<void> {
    const user = await this.userRepository.get(input.userId);

    if (!user) {
      throw new Error('User not found');
    }

    const currentPasswordVO = Password.create(input.currentPassword);
    const isValid = currentPasswordVO.compareWithHash(user.password.value);
    if (!isValid) {
      throw new Error('Senha atual incorreta');
    }

    Password.createWithConfirmation(input.newPassword, input.confirmPassword);
    user.changePassword(input.newPassword);

    await this.userRepository.update(user);
  }
}
