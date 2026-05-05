import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';
import { weingutSektgutWebsiteContentByLocale } from '@/content/seo/weingut-sektgut-website';
import {
  createSeoMetadata,
  createSeoSchemas,
  getLocalizedContent,
  localeToPathPrefix,
  PALATINATE_HREFLANG,
} from '@/lib/seo';
import { isTurnstileEnabled } from '@/lib/turnstile';
import { siteConfig } from '@/config/site';

interface WeingutSektgutWebsitePageProps {
  params: Promise<{ locale: string }>;
}

const pathByLocale = {
  de: '/branchen/weingut-sektgut-website',
  en: '/en/branchen/weingut-sektgut-website',
  pfl: '/pfl/branchen/weingut-sektgut-website',
} as const;

export async function generateMetadata({
  params,
}: WeingutSektgutWebsitePageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = getLocalizedContent(
    locale,
    weingutSektgutWebsiteContentByLocale
  );
  const canonicalPath = `${localeToPathPrefix(locale)}/branchen/weingut-sektgut-website`;

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

export default async function WeingutSektgutWebsitePage({
  params,
}: WeingutSektgutWebsitePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const content = getLocalizedContent(
    locale,
    weingutSektgutWebsiteContentByLocale
  );
  const canonicalPath = `${localeToPathPrefix(locale)}/branchen/weingut-sektgut-website`;
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
