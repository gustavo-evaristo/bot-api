import { FormEntity } from '../entities/form.entity';

export interface FormWithCount extends FormEntity {
  responsesCount: number;
}

export interface FormAnswerDetail {
  fieldId: string;
  fieldLabel: string;
  fieldType: string;
  value: string;
}

export interface FormResponseDetail {
  id: string;
  createdAt: Date;
  answers: FormAnswerDetail[];
}

export abstract class IFormRepository {
  abstract create(form: FormEntity): Promise<void>;
  abstract get(id: string, userId: string): Promise<FormEntity | null>;
  abstract getByIdInternal(id: string): Promise<FormEntity | null>;
  abstract getByToken(token: string): Promise<FormEntity | null>;
  abstract update(form: FormEntity): Promise<void>;
  abstract findManyByUserId(userId: string): Promise<FormWithCount[]>;
  abstract delete(form: FormEntity): Promise<void>;
  abstract saveFieldsAndOptions(form: FormEntity): Promise<void>;
  abstract saveResponse(
    formId: string,
    answers: { fieldId: string; value: string }[],
  ): Promise<void>;
  abstract listResponses(
    formId: string,
    userId: string,
  ): Promise<FormResponseDetail[]>;
}
