import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';
import { ferienwohnungWebsiteContentByLocale } from '@/content/seo/ferienwohnung-website';
import {
  createSeoMetadata,
  createSeoSchemas,
  getLocalizedContent,
  localeToPathPrefix,
  PALATINATE_HREFLANG,
} from '@/lib/seo';
import { siteConfig } from '@/config/site';

interface FerienwohnungWebsitePageProps {
  params: Promise<{ locale: string }>;
}

const pathByLocale = {
  de: '/branchen/ferienwohnung-website',
  en: '/en/branchen/ferienwohnung-website',
  pfl: '/pfl/branchen/ferienwohnung-website',
} as const;

export async function generateMetadata({
  params,
}: FerienwohnungWebsitePageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = getLocalizedContent(
    locale,
    ferienwohnungWebsiteContentByLocale
  );
  const canonicalPath = `${localeToPathPrefix(locale)}/branchen/ferienwohnung-website`;

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

export default async function FerienwohnungWebsitePage({
  params,
}: FerienwohnungWebsitePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const content = getLocalizedContent(
    locale,
    ferienwohnungWebsiteContentByLocale
  );
  const canonicalPath = `${localeToPathPrefix(locale)}/branchen/ferienwohnung-website`;
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;
  const { faqSchema, serviceSchema } = createSeoSchemas({
    locale,
    content,
    canonicalUrl,
  });

  return (
    <>
      <SeoLandingPage content={content} locale={locale} activeNav="industry" />
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
