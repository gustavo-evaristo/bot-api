import { Injectable, NotFoundException } from '@nestjs/common';
import { IFormRepository } from 'src/domain/repositories/form.repository';

interface Input {
  formId: string;
  responseId: string;
  userId: string;
}

@Injectable()
export class DeleteFormResponseUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  async execute({ formId, responseId, userId }: Input): Promise<void> {
    const form = await this.formRepository.get(formId, userId);

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    await this.formRepository.deleteResponse(responseId);
  }
}
