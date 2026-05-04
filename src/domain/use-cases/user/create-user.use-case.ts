import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../entities/user.entity';
import { CompanyEntity } from '../../entities/company.entity';
import { Password } from '../../entities/vos';
import { IUserRepository } from '../../repositories/user.repository';
import { ICompanyRepository } from '../../repositories/company.repository';
import { JwtService } from '@nestjs/jwt';

interface Input {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface Output {
  user: UserEntity;
  company: CompanyEntity;
  token: string;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly companyRepository: ICompanyRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute({
    name,
    email,
    phone,
    password,
    confirmPassword,
  }: Input): Promise<Output> {
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

    const baseName = name.trim() || 'Empresa';
    const company = new CompanyEntity({
      name: `${baseName} — Workspace`,
    });

    await this.companyRepository.create(company);

    const user = new UserEntity({
      name,
      email,
      phone,
      password: userPassword,
      companyId: company.id,
      role: 'ADMIN',
    });

    await this.userRepository.create(user);

    const payload = { id: user.id.toString() };

    const token = this.jwtService.sign(payload);

    return { user, company, token };
  }
}
