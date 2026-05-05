import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';
import { restaurantWebsiteContentByLocale } from '@/content/seo/restaurant-website';
import {
  createSeoMetadata,
  createSeoSchemas,
  getLocalizedContent,
  localeToPathPrefix,
  PALATINATE_HREFLANG,
} from '@/lib/seo';
import { isTurnstileEnabled } from '@/lib/turnstile';
import { siteConfig } from '@/config/site';

interface RestaurantWebsitePageProps {
  params: Promise<{ locale: string }>;
}

const pathByLocale = {
  de: '/branchen/restaurant-website',
  en: '/en/branchen/restaurant-website',
  pfl: '/pfl/branchen/restaurant-website',
} as const;

export async function generateMetadata({
  params,
}: RestaurantWebsitePageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = getLocalizedContent(locale, restaurantWebsiteContentByLocale);
  const canonicalPath = `${localeToPathPrefix(locale)}/branchen/restaurant-website`;

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

export default async function RestaurantWebsitePage({
  params,
}: RestaurantWebsitePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const content = getLocalizedContent(locale, restaurantWebsiteContentByLocale);
  const canonicalPath = `${localeToPathPrefix(locale)}/branchen/restaurant-website`;
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
