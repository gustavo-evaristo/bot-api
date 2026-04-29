import { UUID } from './vos';
import { FormFieldOptionEntity } from './form-field-option.entity';

export type FormFieldType =
  | 'WELCOME_SCREEN'
  | 'THANK_YOU_SCREEN'
  | 'TEXT'
  | 'EMAIL'
  | 'PHONE'
  | 'NUMBER'
  | 'CPF'
  | 'DATE'
  | 'ADDRESS'
  | 'REFERENCE'
  | 'MULTIPLE_CHOICE'
  | 'CHECKBOX'
  | 'SELECT';

interface FormFieldEntityProps {
  id?: string | UUID | null;
  formId: string | UUID;
  isDeleted?: boolean | null;
  type: FormFieldType;
  title?: string | null;
  label: string;
  placeholder?: string | null;
  required?: boolean;
  order?: number;
  options?: FormFieldOptionEntity[];
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export class FormFieldEntity {
  id: UUID;
  formId: UUID;
  isDeleted: boolean;
  type: FormFieldType;
  title: string | null;
  label: string;
  placeholder: string | null;
  required: boolean;
  order: number;
  options: FormFieldOptionEntity[];
  createdAt: Date;
  updatedAt: Date;

  constructor(props: FormFieldEntityProps) {
    if (props.id instanceof UUID) {
      this.id = props.id;
    } else if (typeof props.id === 'string') {
      this.id = UUID.from(props.id);
    } else {
      this.id = UUID.generate();
    }

    this.formId =
      props.formId instanceof UUID ? props.formId : UUID.from(props.formId);

    this.isDeleted = props.isDeleted ?? false;
    this.type = props.type;
    this.title = props.title ?? null;
    this.label = props.label;
    this.placeholder = props.placeholder ?? null;
    this.required = props.required ?? false;
    this.order = props.order ?? 0;
    this.options = props.options ?? [];

    const now = new Date();
    this.createdAt = props.createdAt ?? now;
    this.updatedAt = props.updatedAt ?? now;
  }
}
