import type { IntakeTemplateDefinition } from '@/types/intake';
import { brandingTemplate } from './branding';
import { websiteRelaunchTemplate } from './relaunch';
import { seoContentTemplate } from './seo-content';

export const intakeTemplates: IntakeTemplateDefinition[] = [
  websiteRelaunchTemplate,
  brandingTemplate,
  seoContentTemplate,
];

export function getIntakeTemplateBySlug(slug: string) {
  return intakeTemplates.find((template) => template.slug === slug);
}
