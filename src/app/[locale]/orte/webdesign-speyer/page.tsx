import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';
import { webdesignSpeyerContentByLocale } from '@/content/seo/webdesign-speyer';
import {
  createSeoMetadata,
  createSeoSchemas,
  getLocalizedContent,
  localeToPathPrefix,
  PALATINATE_HREFLANG,
} from '@/lib/seo';
import { isTurnstileEnabled } from '@/lib/turnstile';
import { siteConfig } from '@/config/site';

interface WebdesignSpeyerPageProps {
  params: Promise<{ locale: string }>;
}

const pathByLocale = {
  de: '/orte/webdesign-speyer',
  en: '/en/orte/webdesign-speyer',
  pfl: '/pfl/orte/webdesign-speyer',
} as const;

export async function generateMetadata({
  params,
}: WebdesignSpeyerPageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = getLocalizedContent(locale, webdesignSpeyerContentByLocale);
  const canonicalPath = `${localeToPathPrefix(locale)}/orte/webdesign-speyer`;

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

export default async function WebdesignSpeyerPage({
  params,
}: WebdesignSpeyerPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const content = getLocalizedContent(locale, webdesignSpeyerContentByLocale);
  const canonicalPath = `${localeToPathPrefix(locale)}/orte/webdesign-speyer`;
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
