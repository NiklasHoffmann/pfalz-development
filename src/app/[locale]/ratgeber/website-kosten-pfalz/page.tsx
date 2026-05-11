import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';
import { websiteKostenPfalzContentByLocale } from '@/content/seo/website-kosten-pfalz';
import {
  createSeoMetadata,
  createSeoSchemas,
  getLocalizedContent,
  localeToPathPrefix,
  PALATINATE_HREFLANG,
} from '@/lib/seo';
import { isTurnstileEnabled } from '@/lib/turnstile';
import { siteConfig } from '@/config/site';

interface WebsiteKostenPfalzPageProps {
  params: Promise<{ locale: string }>;
}

const pathByLocale = {
  de: '/ratgeber/website-kosten-pfalz',
  en: '/en/ratgeber/website-kosten-pfalz',
  pfl: '/pfl/ratgeber/website-kosten-pfalz',
} as const;

export async function generateMetadata({
  params,
}: WebsiteKostenPfalzPageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = getLocalizedContent(
    locale,
    websiteKostenPfalzContentByLocale
  );
  const canonicalPath = `${localeToPathPrefix(locale)}/ratgeber/website-kosten-pfalz`;

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

export default async function WebsiteKostenPfalzPage({
  params,
}: WebsiteKostenPfalzPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const content = getLocalizedContent(
    locale,
    websiteKostenPfalzContentByLocale
  );
  const canonicalPath = `${localeToPathPrefix(locale)}/ratgeber/website-kosten-pfalz`;
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
