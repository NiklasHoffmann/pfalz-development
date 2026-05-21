import type { IntakeTemplateDefinition } from '@/types/intake';
import { brandingTemplate } from './branding';
import { fewoTemplatePack } from './packages/branchen/fewo';
import { restaurantTemplatePack } from './packages/branchen/restaurants';
import { serviceTemplatePack } from './packages/leistungen/dienstleister';
import { websiteRelaunchTemplate } from './relaunch';
import { seoContentTemplate } from './seo-content';

export const intakeTemplates: IntakeTemplateDefinition[] = [
  websiteRelaunchTemplate,
  brandingTemplate,
  seoContentTemplate,
  ...fewoTemplatePack,
  ...restaurantTemplatePack,
  ...serviceTemplatePack,
];

export const intakeTemplateOptions = intakeTemplates.map((template) => ({
  value: template.slug,
  label: template.title,
}));

export function getIntakeTemplateBySlug(slug: string) {
  return intakeTemplates.find((template) => template.slug === slug);
}
