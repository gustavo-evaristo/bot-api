import { Injectable } from '@nestjs/common';
import { Password } from '../../entities/vos';
import { IUserRepository } from '../../repositories/user.repository';
import { ICompanyRepository } from '../../repositories/company.repository';
import { UserEntity } from '../../entities/user.entity';
import { CompanyEntity } from '../../entities/company.entity';
import { JwtService } from '@nestjs/jwt';

interface Output {
  user: UserEntity;
  company: CompanyEntity | null;
  token: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly companyRepository: ICompanyRepository,
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

    const company = await this.companyRepository.get(user.companyId.toString());

    const payload = { id: user.id.toString() };

    const token = this.jwtService.sign(payload);

    return { user, company, token };
  }
}
