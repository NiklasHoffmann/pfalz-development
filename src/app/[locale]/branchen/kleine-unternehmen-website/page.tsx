import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';
import { kleineUnternehmenWebsiteContentByLocale } from '@/content/seo/kleine-unternehmen-website';
import {
  createSeoMetadata,
  createSeoSchemas,
  getLocalizedContent,
  localeToPathPrefix,
  PALATINATE_HREFLANG,
} from '@/lib/seo';
import { isTurnstileEnabled } from '@/lib/turnstile';
import { siteConfig } from '@/config/site';

interface KleineUnternehmenWebsitePageProps {
  params: Promise<{ locale: string }>;
}

const pathByLocale = {
  de: '/branchen/kleine-unternehmen-website',
  en: '/en/branchen/kleine-unternehmen-website',
  pfl: '/pfl/branchen/kleine-unternehmen-website',
} as const;

export async function generateMetadata({
  params,
}: KleineUnternehmenWebsitePageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = getLocalizedContent(
    locale,
    kleineUnternehmenWebsiteContentByLocale
  );
  const canonicalPath = `${localeToPathPrefix(locale)}/branchen/kleine-unternehmen-website`;

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

export default async function KleineUnternehmenWebsitePage({
  params,
}: KleineUnternehmenWebsitePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const content = getLocalizedContent(
    locale,
    kleineUnternehmenWebsiteContentByLocale
  );
  const canonicalPath = `${localeToPathPrefix(locale)}/branchen/kleine-unternehmen-website`;
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
