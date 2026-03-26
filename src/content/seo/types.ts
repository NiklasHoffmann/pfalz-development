import { z } from 'zod';

export const seoLocaleSchema = z.enum(['de', 'en', 'pfl']);

const faqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const sectionSchema = z.object({
  title: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(1),
});

const ctaSchema = z.object({
  primaryLabel: z.string().min(1),
  primaryHref: z.string().min(1),
  secondaryLabel: z.string().min(1),
  secondaryHref: z.string().min(1),
});

const relatedSchema = z.object({
  label: z.string().min(1),
  pageLabel: z.string().min(1),
  href: z.string().min(1),
});

const serviceSchema = z.object({
  name: z.string().min(1),
  serviceType: z.string().min(1),
  areaServed: z.string().min(1),
});

export const seoPageContentSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  h1: z.string().min(1),
  eyebrow: z.string().min(1),
  intro: z.string().min(1),
  sections: z.array(sectionSchema).min(1),
  faqTitle: z.string().min(1),
  faq: z.array(faqItemSchema).min(1),
  cta: ctaSchema,
  related: relatedSchema,
  backToHome: z.string().min(1),
  service: serviceSchema,
});

export const localizedSeoPageContentSchema = z.object({
  de: seoPageContentSchema,
  en: seoPageContentSchema,
  pfl: seoPageContentSchema,
});

export type SeoLocale = z.infer<typeof seoLocaleSchema>;
export type SeoPageContent = z.infer<typeof seoPageContentSchema>;
export type LocalizedSeoPageContent = z.infer<
  typeof localizedSeoPageContentSchema
>;

export function parseLocalizedSeoPageContent(
  input: unknown
): LocalizedSeoPageContent {
  return localizedSeoPageContentSchema.parse(input);
}
