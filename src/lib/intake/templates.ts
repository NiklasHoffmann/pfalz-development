import connectToDatabase from '@/lib/mongodb';
import IntakeForm from '@/models/IntakeForm';
import { intakeTemplates } from '@/content/intake/templates';

export async function seedIntakeTemplates(options?: { overwrite?: boolean }) {
  await connectToDatabase();

  const overwrite = options?.overwrite ?? false;
  const results: Array<{
    slug: string;
    action: 'created' | 'updated' | 'skipped';
  }> = [];

  for (const template of intakeTemplates) {
    const existingForm = await IntakeForm.findOne({
      slug: template.slug,
    }).exec();

    if (!existingForm) {
      await IntakeForm.create(template);
      results.push({ slug: template.slug, action: 'created' });
      continue;
    }

    if (!overwrite) {
      results.push({ slug: template.slug, action: 'skipped' });
      continue;
    }

    await IntakeForm.findByIdAndUpdate(existingForm._id, {
      $set: template,
    }).exec();
    results.push({ slug: template.slug, action: 'updated' });
  }

  return results;
}
