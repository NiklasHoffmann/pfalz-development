import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HomePageView } from '@/components/home/HomePageView';
import { siteConfig } from '@/config/site';
import type {
  CardItem,
  ContactDetails,
  FaqItem,
  HomePageData,
  PackageItem,
} from '@/components/home/types';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

function localeToOgLocale(locale: string): string {
  if (locale === 'en') return 'en_US';
  if (locale === 'pfl') return 'de_DE';
  return 'de_DE';
}

function localeToPath(locale: string): string {
  return locale === 'de' ? '' : `/${locale}`;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common.home' });
  const canonicalPath = localeToPath(locale);
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;

  return {
    title: t('headline'),
    description: t('subheadline'),
    keywords: [
      'Website erstellen lassen Pfalz',
      'Webdesign Neustadt an der Weinstrasse',
      'Webdesign Landau in der Pfalz',
      'Webentwickler Pfalz',
      'Homepage fuer Unternehmen Pfalz',
      'Website fuer Ferienwohnung Pfalz',
      'Website fuer Restaurant Pfalz',
      'Webdesign Bad Duerkheim',
      'Webdesign Speyer',
      'Webdesign Ludwigshafen',
    ],
    alternates: {
      canonical: canonicalPath || '/',
      languages: {
        de: '/',
        en: '/en',
        'x-default': '/',
      },
    },
    openGraph: {
      type: 'website',
      locale: localeToOgLocale(locale),
      url: canonicalUrl,
      title: t('headline'),
      description: t('subheadline'),
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('headline'),
      description: t('subheadline'),
      images: [siteConfig.ogImage],
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  const navT = await getTranslations({ locale, namespace: 'navigation' });
  const trustItems = t.raw('home.trust.items') as string[];
  const serviceItems = t.raw('home.services.items') as CardItem[];
  const audiences = t.raw('home.audiences.items') as string[];
  const whyMeItems = t.raw('home.whyMe.items') as string[];
  const packageItems = t.raw('home.packages.items') as PackageItem[];
  const processSteps = t.raw('home.process.steps') as string[];
  const faqItems = t.raw('home.faq.items') as FaqItem[];
  const contactDetails = t.raw('home.contact') as ContactDetails;
  const legalT = await getTranslations({ locale, namespace: 'legal' });
  const navItems = [
    { label: navT('home'), href: '#start' },
    { label: navT('about'), href: '#leistungen' },
    { label: navT('packages'), href: '#pakete' },
    { label: navT('process'), href: '#ablauf' },
    { label: navT('contact'), href: '#kontakt' },
  ];
  const mobileNavItems = [
    { label: navT('home'), href: '#start', shortLabel: 'Start' },
    { label: navT('about'), href: '#leistungen', shortLabel: 'Leistung' },
    { label: navT('packages'), href: '#pakete', shortLabel: 'Pakete' },
    { label: navT('contact'), href: '#kontakt', shortLabel: 'Kontakt' },
  ];
  const canonicalPath = localeToPath(locale);
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;

  const pageData: HomePageData = {
    appName: t('appName'),
    navItems,
    mobileNavItems,
    hero: {
      eyebrow: t('home.eyebrow'),
      headline: t('home.headline'),
      subheadline: t('home.subheadline'),
      primaryCta: t('home.primaryCta'),
      secondaryCta: t('home.secondaryCta'),
      trustTitle: t('home.trust.title'),
      trustItems,
    },
    services: {
      title: t('home.services.title'),
      items: serviceItems,
    },
    audiences: {
      title: t('home.audiences.title'),
      items: audiences,
    },
    whyMe: {
      title: t('home.whyMe.title'),
      items: whyMeItems,
    },
    packages: {
      title: t('home.packages.title'),
      items: packageItems,
    },
    process: {
      title: t('home.process.title'),
      steps: processSteps,
    },
    faq: {
      title: t('home.faq.title'),
      items: faqItems,
    },
    contact: {
      navLabel: navT('contact'),
      title: t('home.contact.title'),
      description: t('home.contact.description'),
      primaryCta: t('home.contact.primaryCta'),
      secondaryCta: t('home.contact.secondaryCta'),
      details: contactDetails,
    },
    footer: {
      note: legalT('footerNote'),
      imprintLabel: legalT('imprint.title'),
      privacyLabel: legalT('privacy.title'),
    },
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: siteConfig.name,
    url: canonicalUrl,
    areaServed: [
      'Neustadt an der Weinstrasse',
      'Landau in der Pfalz',
      'Bad Duerkheim',
      'Speyer',
      'Ludwigshafen',
      'Pfalz',
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Froebelstrasse 20',
      postalCode: '67433',
      addressLocality: 'Neustadt an der Weinstrasse',
      addressCountry: 'DE',
    },
    email: 'hoffmann.niklas@googlemail.com',
    serviceType: [
      'Webdesign',
      'Webentwicklung',
      'Website Erstellung',
      'Website Wartung',
      'Hosting',
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <HomePageView data={pageData} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
    </>
  );
}
