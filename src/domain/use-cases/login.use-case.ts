import { IUserRepository } from '../repositories/user.repository';

export class LoginUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute({ email, password }) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error('User not found');
    }
  }
}
