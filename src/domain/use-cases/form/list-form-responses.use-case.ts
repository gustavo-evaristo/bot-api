import { Injectable } from '@nestjs/common';
import {
  IFormRepository,
  FormResponseDetail,
} from 'src/domain/repositories/form.repository';

interface Input {
  formId: string;
  userId: string;
}

@Injectable()
export class ListFormResponsesUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  async execute({ formId, userId }: Input): Promise<FormResponseDetail[]> {
    const form = await this.formRepository.get(formId, userId);

    if (!form) {
      throw new Error('Form not found');
    }

    return this.formRepository.listResponses(formId, userId);
  }
}
