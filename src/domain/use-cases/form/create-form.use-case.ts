import { Injectable } from '@nestjs/common';
import { FormEntity } from 'src/domain/entities/form.entity';
import { IFormRepository } from 'src/domain/repositories/form.repository';
import { IUserRepository } from 'src/domain/repositories';

interface Input {
  userId: string;
  title: string;
  description?: string | null;
}

@Injectable()
export class CreateFormUseCase {
  constructor(
    private readonly formRepository: IFormRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute({ userId, title, description }: Input): Promise<FormEntity> {
    const user = await this.userRepository.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const form = new FormEntity({ userId, title, description });

    await this.formRepository.create(form);

    return form;
  }
}
