import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../entities/user.entity';
import { Password } from '../../entities/vos';
import { IUserRepository } from '../../repositories/user.repository';

interface Input {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute({
    name,
    email,
    phone,
    password,
    confirmPassword,
  }: Input): Promise<UserEntity> {
    const userPassword = Password.createWithConfirmation(
      password,
      confirmPassword,
    );

    const userExists = await this.userRepository.findByEmailOrPhone({
      email,
      phone,
    });

    if (userExists) {
      throw new Error('User already exists');
    }

    const user = new UserEntity({
      name,
      email,
      phone,
      password: userPassword,
    });

    await this.userRepository.create(user);

    return user;
  }
}
