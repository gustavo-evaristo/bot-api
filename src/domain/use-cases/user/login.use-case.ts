import { Injectable } from '@nestjs/common';
import { Password } from '../../entities/vos';
import { IUserRepository } from '../../repositories/user.repository';
import { UserEntity } from '../../entities/user.entity';
import { JwtService } from '@nestjs/jwt';

interface Output {
  user: UserEntity;
  token: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute({ email, password }): Promise<Output> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error('User not found');
    }

    const passwordVO = Password.create(password);

    const isValidPassword = passwordVO.compareWithHash(user.password.value);

    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    const payload = { id: user.id.toString() };

    const token = this.jwtService.sign(payload);

    return { user, token };
  }
}
