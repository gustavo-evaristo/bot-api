import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../entities/user.entity';
import { CompanyEntity } from '../../entities/company.entity';
import { Password } from '../../entities/vos';
import { IUserRepository } from '../../repositories/user.repository';
import { ICompanyRepository } from '../../repositories/company.repository';

interface Input {
  userId: string;
  name?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string | null;
  companyName?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface Output {
  user: UserEntity;
  company: CompanyEntity | null;
}

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(input: Input): Promise<Output> {
    const user = await this.userRepository.get(input.userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (input.email && input.email !== user.email) {
      const existing = await this.userRepository.findByEmail(input.email);
      if (existing && existing.id.toString() !== user.id.toString()) {
        throw new Error('Email já está em uso');
      }
    }

    if (input.phone && input.phone !== user.phone) {
      const existing = await this.userRepository.findByEmailOrPhone({
        email: user.email,
        phone: input.phone,
      });
      if (existing && existing.id.toString() !== user.id.toString()) {
        throw new Error('Telefone já está em uso');
      }
    }

    user.updateProfile({
      name: input.name,
      email: input.email,
      phone: input.phone,
      avatarUrl: input.avatarUrl,
    });

    if (input.newPassword || input.confirmPassword || input.currentPassword) {
      if (!input.currentPassword) {
        throw new Error('Senha atual é obrigatória para alterar a senha');
      }
      if (!input.newPassword || !input.confirmPassword) {
        throw new Error('Informe a nova senha e a confirmação');
      }
      const currentPasswordVO = Password.create(input.currentPassword);
      const isValid = currentPasswordVO.compareWithHash(user.password.value);
      if (!isValid) {
        throw new Error('Senha atual incorreta');
      }
      Password.createWithConfirmation(input.newPassword, input.confirmPassword);
      user.changePassword(input.newPassword);
    }

    await this.userRepository.update(user);

    let company = await this.companyRepository.get(user.companyId.toString());

    if (company && input.companyName && input.companyName !== company.name) {
      company.rename(input.companyName);
      await this.companyRepository.update(company);
    }

    return { user, company };
  }
}
