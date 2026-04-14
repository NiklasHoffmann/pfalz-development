import type { IIntakeForm, IntakeFormSnapshot } from '@/types/intake';

export function createIntakeFormSnapshot(
  form: Pick<
    IIntakeForm,
    | 'title'
    | 'slug'
    | 'description'
    | 'formType'
    | 'version'
    | 'sections'
    | 'notificationConfig'
  >
): IntakeFormSnapshot {
  return {
    title: form.title,
    slug: form.slug,
    description: form.description,
    formType: form.formType,
    version: form.version,
    sections: JSON.parse(JSON.stringify(form.sections)),
    notificationConfig: form.notificationConfig
      ? JSON.parse(JSON.stringify(form.notificationConfig))
      : undefined,
  };
}
