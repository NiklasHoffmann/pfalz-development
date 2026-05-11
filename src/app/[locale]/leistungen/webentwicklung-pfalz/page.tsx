import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';
import { webentwicklungPfalzContentByLocale } from '@/content/seo/webentwicklung-pfalz';
import {
  createSeoMetadata,
  createSeoSchemas,
  getLocalizedContent,
  localeToPathPrefix,
  PALATINATE_HREFLANG,
} from '@/lib/seo';
import { isTurnstileEnabled } from '@/lib/turnstile';
import { siteConfig } from '@/config/site';

interface WebentwicklungPfalzPageProps {
  params: Promise<{ locale: string }>;
}

const pathByLocale = {
  de: '/leistungen/webentwicklung-pfalz',
  en: '/en/leistungen/webentwicklung-pfalz',
  pfl: '/pfl/leistungen/webentwicklung-pfalz',
} as const;

export async function generateMetadata({
  params,
}: WebentwicklungPfalzPageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = getLocalizedContent(
    locale,
    webentwicklungPfalzContentByLocale
  );
  const canonicalPath = `${localeToPathPrefix(locale)}/leistungen/webentwicklung-pfalz`;

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

export default async function WebentwicklungPfalzPage({
  params,
}: WebentwicklungPfalzPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const content = getLocalizedContent(
    locale,
    webentwicklungPfalzContentByLocale
  );
  const canonicalPath = `${localeToPathPrefix(locale)}/leistungen/webentwicklung-pfalz`;
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
