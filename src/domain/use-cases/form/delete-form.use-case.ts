import { Injectable } from '@nestjs/common';
import { IFormRepository } from 'src/domain/repositories/form.repository';

interface Input {
  formId: string;
  userId: string;
}

@Injectable()
export class DeleteFormUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  async execute({ formId, userId }: Input): Promise<void> {
    const form = await this.formRepository.get(formId, userId);

    if (!form) {
      throw new Error('Form not found');
    }

    form.delete();

    await this.formRepository.delete(form);
  }
}
