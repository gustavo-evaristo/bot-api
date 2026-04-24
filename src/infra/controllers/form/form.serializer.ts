import { FormEntity } from 'src/domain/entities/form.entity';

export function serializeForm(form: FormEntity & { responsesCount?: number }) {
  return {
    id: form.id.toString(),
    title: form.title,
    description: form.description,
    token: form.token,
    isActive: form.isActive,
    responsesCount: form.responsesCount ?? 0,
    fields: form.fields.map((f) => ({
      id: f.id.toString(),
      type: f.type,
      title: f.title,
      label: f.label,
      placeholder: f.placeholder,
      required: f.required,
      order: f.order,
      options: f.options.map((o) => ({
        id: o.id.toString(),
        label: o.label,
      })),
    })),
    createdAt: form.createdAt,
    updatedAt: form.updatedAt,
  };
}
