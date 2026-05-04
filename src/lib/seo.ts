import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import type { SeoLocale, SeoPageContent } from '@/content/seo/types';

export const PALATINATE_HREFLANG = 'de-x-pfalz';

export function localeToPathPrefix(locale: string): string {
  return locale === 'de' ? '' : `/${locale}`;
}

export function localeToHtmlLang(locale: string): string {
  if (locale === 'en') return 'en';
  if (locale === 'pfl') return PALATINATE_HREFLANG;
  return 'de';
}

export function localeToLanguageTag(locale: string): string {
  if (locale === 'en') return 'en-US';
  if (locale === 'pfl') return PALATINATE_HREFLANG;
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

export function createPageMetadata({
  locale,
  canonicalPath,
  languages,
  title,
  description,
}: {
  locale: string;
  canonicalPath: string;
  languages: Record<string, string>;
  title: string;
  description: string;
}): Metadata {
  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: canonicalPath,
      languages,
    },
    openGraph: {
      type: 'website',
      locale: localeToOgLocale(locale),
      url: `${siteConfig.url}${canonicalPath}`,
      title,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [siteConfig.ogImage],
    },
  };
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
  return createPageMetadata({
    locale,
    canonicalPath,
    languages,
    title: content.title,
    description: content.description,
  });
}

export function createSeoSchemas({
  locale,
  content,
  canonicalUrl,
  hideDirectContactLinks = false,
}: {
  locale: string;
  content: SeoPageContent;
  canonicalUrl: string;
  hideDirectContactLinks?: boolean;
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
      description: content.description,
      provider: {
        '@type': 'ProfessionalService',
        name: siteConfig.name,
        url: siteConfig.url,
        ...(hideDirectContactLinks
          ? {}
          : {
              email: siteConfig.contact.email,
              telephone: siteConfig.contact.phoneHref,
            }),
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Froebelstrasse 20',
          postalCode: '67433',
          addressLocality: 'Neustadt an der Weinstraße',
          addressCountry: 'DE',
        },
        areaServed: 'Pfalz',
      },
      areaServed: content.service.areaServed,
      serviceType: content.service.serviceType,
      url: canonicalUrl,
      inLanguage,
    },
  };
}
