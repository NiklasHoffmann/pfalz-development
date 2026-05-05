import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';
import { webdesignPfalzContentByLocale } from '@/content/seo/webdesign-pfalz';
import {
  createSeoMetadata,
  createSeoSchemas,
  getLocalizedContent,
  localeToPathPrefix,
  PALATINATE_HREFLANG,
} from '@/lib/seo';
import { isTurnstileEnabled } from '@/lib/turnstile';
import { siteConfig } from '@/config/site';

interface WebdesignPfalzPageProps {
  params: Promise<{ locale: string }>;
}

const pathByLocale = {
  de: '/leistungen/webdesign-pfalz',
  en: '/en/leistungen/webdesign-pfalz',
  pfl: '/pfl/leistungen/webdesign-pfalz',
} as const;

export async function generateMetadata({
  params,
}: WebdesignPfalzPageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = getLocalizedContent(locale, webdesignPfalzContentByLocale);
  const canonicalPath = `${localeToPathPrefix(locale)}/leistungen/webdesign-pfalz`;

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

export default async function WebdesignPfalzPage({
  params,
}: WebdesignPfalzPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const content = getLocalizedContent(locale, webdesignPfalzContentByLocale);
  const canonicalPath = `${localeToPathPrefix(locale)}/leistungen/webdesign-pfalz`;
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
