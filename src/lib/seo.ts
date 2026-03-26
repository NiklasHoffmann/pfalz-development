import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import type { SeoLocale, SeoPageContent } from '@/content/seo/types';

export function localeToPathPrefix(locale: string): string {
  return locale === 'de' ? '' : `/${locale}`;
}

export function localeToLanguageTag(locale: string): string {
  if (locale === 'en') return 'en-US';
  return 'de-DE';
}

export function localeToOgLocale(locale: string): string {
  if (locale === 'en') return 'en_US';
  return 'de_DE';
}

export function toSeoLocale(locale: string): SeoLocale {
  return locale === 'en' || locale === 'pfl' ? locale : 'de';
}

export function getLocalizedContent(
  locale: string,
  localizedContent: Record<SeoLocale, SeoPageContent>
): SeoPageContent {
  return localizedContent[toSeoLocale(locale)];
}

export function createSeoMetadata({
  locale,
  canonicalPath,
  languages,
  content,
}: {
  locale: string;
  canonicalPath: string;
  languages: Record<string, string>;
  content: SeoPageContent;
}): Metadata {
  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical: canonicalPath,
      languages,
    },
    openGraph: {
      type: 'website',
      locale: localeToOgLocale(locale),
      url: `${siteConfig.url}${canonicalPath}`,
      title: content.title,
      description: content.description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: content.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.description,
      images: [siteConfig.ogImage],
    },
  };
}

export function createSeoSchemas({
  locale,
  content,
  canonicalUrl,
}: {
  locale: string;
  content: SeoPageContent;
  canonicalUrl: string;
}) {
  const inLanguage = localeToLanguageTag(locale);

  return {
    faqSchema: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage,
      mainEntity: content.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
    serviceSchema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: content.service.name,
      provider: {
        '@type': 'ProfessionalService',
        name: siteConfig.name,
        url: siteConfig.url,
      },
      areaServed: content.service.areaServed,
      serviceType: content.service.serviceType,
      url: canonicalUrl,
      inLanguage,
    },
  };
}
