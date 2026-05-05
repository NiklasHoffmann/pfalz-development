import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';
import { webdesignLandauContentByLocale } from '@/content/seo/webdesign-landau';
import {
  createSeoMetadata,
  createSeoSchemas,
  getLocalizedContent,
  localeToPathPrefix,
  PALATINATE_HREFLANG,
} from '@/lib/seo';
import { isTurnstileEnabled } from '@/lib/turnstile';
import { siteConfig } from '@/config/site';

interface WebdesignLandauPageProps {
  params: Promise<{ locale: string }>;
}

const pathByLocale = {
  de: '/orte/webdesign-landau',
  en: '/en/orte/webdesign-landau',
  pfl: '/pfl/orte/webdesign-landau',
} as const;

export async function generateMetadata({
  params,
}: WebdesignLandauPageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = getLocalizedContent(locale, webdesignLandauContentByLocale);
  const canonicalPath = `${localeToPathPrefix(locale)}/orte/webdesign-landau`;

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

export default async function WebdesignLandauPage({
  params,
}: WebdesignLandauPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const content = getLocalizedContent(locale, webdesignLandauContentByLocale);
  const canonicalPath = `${localeToPathPrefix(locale)}/orte/webdesign-landau`;
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;
  const { faqSchema, serviceSchema } = createSeoSchemas({
    locale,
    content,
    canonicalUrl,
    hideDirectContactLinks: isTurnstileEnabled(),
  });

  return (
    <>
      <SeoLandingPage content={content} locale={locale} />
      <JsonLdScript data={faqSchema} />
      <JsonLdScript data={serviceSchema} />
    </>
  );
}
