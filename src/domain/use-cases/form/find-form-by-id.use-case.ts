import { Injectable } from '@nestjs/common';
import { FormEntity } from 'src/domain/entities/form.entity';
import { IFormRepository } from 'src/domain/repositories/form.repository';

interface Input {
  formId: string;
  userId: string;
}

@Injectable()
export class FindFormByIdUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  async execute({ formId, userId }: Input): Promise<FormEntity> {
    const form = await this.formRepository.get(formId, userId);

    if (!form) {
      throw new Error('Form not found');
    }

    return form;
  }
}
