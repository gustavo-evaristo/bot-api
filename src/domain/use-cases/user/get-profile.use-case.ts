import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../entities/user.entity';
import { CompanyEntity } from '../../entities/company.entity';
import { IUserRepository } from '../../repositories/user.repository';
import { ICompanyRepository } from '../../repositories/company.repository';

interface Output {
  user: UserEntity;
  company: CompanyEntity | null;
}

@Injectable()
export class GetProfileUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(userId: string): Promise<Output> {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const company = await this.companyRepository.get(user.companyId.toString());

    return { user, company };
  }
}
