import { Injectable } from '@nestjs/common';
import { FormEntity } from 'src/domain/entities/form.entity';
import { IFormRepository } from 'src/domain/repositories/form.repository';

interface Input {
  token: string;
}

@Injectable()
export class GetPublicFormUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  async execute({ token }: Input): Promise<FormEntity> {
    const form = await this.formRepository.getByToken(token);

    if (!form) {
      throw new Error('Form not found');
    }

    return form;
  }
}
