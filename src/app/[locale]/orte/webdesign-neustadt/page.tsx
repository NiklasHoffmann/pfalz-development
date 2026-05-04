import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';
import { webdesignNeustadtContentByLocale } from '@/content/seo/webdesign-neustadt';
import {
  createSeoMetadata,
  createSeoSchemas,
  getLocalizedContent,
  localeToPathPrefix,
  PALATINATE_HREFLANG,
} from '@/lib/seo';
import { isTurnstileEnabled } from '@/lib/turnstile';
import { siteConfig } from '@/config/site';

interface WebdesignNeustadtPageProps {
  params: Promise<{ locale: string }>;
}

const pathByLocale = {
  de: '/orte/webdesign-neustadt',
  en: '/en/orte/webdesign-neustadt',
  pfl: '/pfl/orte/webdesign-neustadt',
} as const;

export async function generateMetadata({
  params,
}: WebdesignNeustadtPageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = getLocalizedContent(locale, webdesignNeustadtContentByLocale);
  const canonicalPath = `${localeToPathPrefix(locale)}/orte/webdesign-neustadt`;

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

export default async function WebdesignNeustadtPage({
  params,
}: WebdesignNeustadtPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const content = getLocalizedContent(locale, webdesignNeustadtContentByLocale);
  const canonicalPath = `${localeToPathPrefix(locale)}/orte/webdesign-neustadt`;
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema),
        }}
      />
    </>
  );
}
