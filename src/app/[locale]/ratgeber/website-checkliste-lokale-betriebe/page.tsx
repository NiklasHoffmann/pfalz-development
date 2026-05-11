import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';
import { websiteChecklisteLokaleBetriebeContentByLocale } from '@/content/seo/website-checkliste-lokale-betriebe';
import {
  createSeoMetadata,
  createSeoSchemas,
  getLocalizedContent,
  localeToPathPrefix,
  PALATINATE_HREFLANG,
} from '@/lib/seo';
import { isTurnstileEnabled } from '@/lib/turnstile';
import { siteConfig } from '@/config/site';

interface WebsiteChecklisteLokaleBetriebePageProps {
  params: Promise<{ locale: string }>;
}

const pathByLocale = {
  de: '/ratgeber/website-checkliste-lokale-betriebe',
  en: '/en/ratgeber/website-checkliste-lokale-betriebe',
  pfl: '/pfl/ratgeber/website-checkliste-lokale-betriebe',
} as const;

export async function generateMetadata({
  params,
}: WebsiteChecklisteLokaleBetriebePageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = getLocalizedContent(
    locale,
    websiteChecklisteLokaleBetriebeContentByLocale
  );
  const canonicalPath = `${localeToPathPrefix(locale)}/ratgeber/website-checkliste-lokale-betriebe`;

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

export default async function WebsiteChecklisteLokaleBetriebePage({
  params,
}: WebsiteChecklisteLokaleBetriebePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const content = getLocalizedContent(
    locale,
    websiteChecklisteLokaleBetriebeContentByLocale
  );
  const canonicalPath = `${localeToPathPrefix(locale)}/ratgeber/website-checkliste-lokale-betriebe`;
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
