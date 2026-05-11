import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';
import { handwerkWebsiteContentByLocale } from '@/content/seo/handwerk-website';
import {
  createSeoMetadata,
  createSeoSchemas,
  getLocalizedContent,
  localeToPathPrefix,
  PALATINATE_HREFLANG,
} from '@/lib/seo';
import { isTurnstileEnabled } from '@/lib/turnstile';
import { siteConfig } from '@/config/site';

interface HandwerkWebsitePageProps {
  params: Promise<{ locale: string }>;
}

const pathByLocale = {
  de: '/branchen/handwerk-website',
  en: '/en/branchen/handwerk-website',
  pfl: '/pfl/branchen/handwerk-website',
} as const;

export async function generateMetadata({
  params,
}: HandwerkWebsitePageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = getLocalizedContent(locale, handwerkWebsiteContentByLocale);
  const canonicalPath = `${localeToPathPrefix(locale)}/branchen/handwerk-website`;

  return createSeoMetadata({
    locale,
    canonicalPath,
    languages: {
      de: pathByLocale.de,
      en: pathByLocale.en,
      [PALATINATE_HREFLANG]: pathByLocale.pfl,
      'x-default': pathByLocale.de,
    },
    content,
  });
}

export default async function HandwerkWebsitePage({
  params,
}: HandwerkWebsitePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const content = getLocalizedContent(locale, handwerkWebsiteContentByLocale);
  const canonicalPath = `${localeToPathPrefix(locale)}/branchen/handwerk-website`;
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;
  const { faqSchema, serviceSchema } = createSeoSchemas({
    locale,
    content,
    canonicalUrl,
    hideDirectContactLinks: isTurnstileEnabled(),
  });

  return (
    <>
      <SeoLandingPage content={content} locale={locale} activeNav="industry" />
      <JsonLdScript data={faqSchema} />
      <JsonLdScript data={serviceSchema} />
    </>
  );
}
