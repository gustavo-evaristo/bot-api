import { Injectable } from '@nestjs/common';
import { IFormRepository } from 'src/domain/repositories/form.repository';

interface AnswerInput {
  fieldId: string;
  value: string | string[];
}

interface Input {
  token: string;
  answers: AnswerInput[];
}

@Injectable()
export class SubmitFormResponseUseCase {
  constructor(private readonly formRepository: IFormRepository) {}

  async execute({ token, answers }: Input): Promise<void> {
    const form = await this.formRepository.getByToken(token);

    if (!form) {
      throw new Error('Form not found');
    }

    const normalizedAnswers = answers.map((a) => ({
      fieldId: a.fieldId,
      value: Array.isArray(a.value) ? a.value.join(', ') : a.value,
    }));

    await this.formRepository.saveResponse(form.id.toString(), normalizedAnswers);
  }
}
