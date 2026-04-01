import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';
import { websiteRelaunchContentByLocale } from '@/content/seo/website-relaunch';
import {
  createSeoMetadata,
  createSeoSchemas,
  getLocalizedContent,
  localeToPathPrefix,
} from '@/lib/seo';
import { siteConfig } from '@/config/site';

interface WebsiteRelaunchPageProps {
  params: Promise<{ locale: string }>;
}

const pathByLocale = {
  de: '/leistungen/website-relaunch',
  en: '/en/leistungen/website-relaunch',
  pfl: '/pfl/leistungen/website-relaunch',
} as const;

export async function generateMetadata({
  params,
}: WebsiteRelaunchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = getLocalizedContent(locale, websiteRelaunchContentByLocale);
  const canonicalPath = `${localeToPathPrefix(locale)}/leistungen/website-relaunch`;

  return createSeoMetadata({
    locale,
    canonicalPath,
    languages: {
      de: pathByLocale.de,
      en: pathByLocale.en,
      'de-PF': pathByLocale.pfl,
      'x-default': pathByLocale.de,
    },
    content,
  });
}

export default async function WebsiteRelaunchPage({
  params,
}: WebsiteRelaunchPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const content = getLocalizedContent(locale, websiteRelaunchContentByLocale);
  const canonicalPath = `${localeToPathPrefix(locale)}/leistungen/website-relaunch`;
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;
  const { faqSchema, serviceSchema } = createSeoSchemas({
    locale,
    content,
    canonicalUrl,
  });

  return (
    <>
      <SeoLandingPage content={content} locale={locale} activeNav="service" />
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
