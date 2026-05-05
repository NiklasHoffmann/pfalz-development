import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';
import { websiteWartungContentByLocale } from '@/content/seo/website-wartung';
import {
  createSeoMetadata,
  createSeoSchemas,
  getLocalizedContent,
  localeToPathPrefix,
  PALATINATE_HREFLANG,
} from '@/lib/seo';
import { isTurnstileEnabled } from '@/lib/turnstile';
import { siteConfig } from '@/config/site';

interface WebsiteWartungPageProps {
  params: Promise<{ locale: string }>;
}

const pathByLocale = {
  de: '/leistungen/website-wartung',
  en: '/en/leistungen/website-wartung',
  pfl: '/pfl/leistungen/website-wartung',
} as const;

export async function generateMetadata({
  params,
}: WebsiteWartungPageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = getLocalizedContent(locale, websiteWartungContentByLocale);
  const canonicalPath = `${localeToPathPrefix(locale)}/leistungen/website-wartung`;

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

export default async function WebsiteWartungPage({
  params,
}: WebsiteWartungPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const content = getLocalizedContent(locale, websiteWartungContentByLocale);
  const canonicalPath = `${localeToPathPrefix(locale)}/leistungen/website-wartung`;
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;
  const { faqSchema, serviceSchema } = createSeoSchemas({
    locale,
    content,
    canonicalUrl,
    hideDirectContactLinks: isTurnstileEnabled(),
  });

  return (
    <>
      <SeoLandingPage content={content} locale={locale} activeNav="service" />
      <JsonLdScript data={faqSchema} />
      <JsonLdScript data={serviceSchema} />
    </>
  );
}
