import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HomePageView } from '@/components/home/HomePageView';
import { siteConfig } from '@/config/site';
import { PALATINATE_HREFLANG } from '@/lib/seo';
import type {
  CardItem,
  ContactDetails,
  FaqItem,
  HomePageData,
  PackageItem,
  SeoLinkItem,
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

function localeToLanguageTag(locale: string): string {
  if (locale === 'en') return 'en-US';
  if (locale === 'pfl') return PALATINATE_HREFLANG;
  return 'de-DE';
}

function localeToBasePath(locale: string): string {
  return locale === 'de' ? '' : `/${locale}`;
}

function localeToIndustryLabel(locale: string): string {
  if (locale === 'en') return 'Industry';
  if (locale === 'pfl') return 'Branche';
  return 'Branche';
}

function localeToMobileShortLabels(locale: string): {
  home: string;
  service: string;
  industry: string;
  contact: string;
} {
  if (locale === 'en') {
    return {
      home: 'Home',
      service: 'Service',
      industry: 'Industry',
      contact: 'Contact',
    };
  }

  if (locale === 'pfl') {
    return {
      home: 'Schtardt',
      service: 'Leischdung',
      industry: 'Branche',
      contact: 'Kontakt',
    };
  }

  return {
    home: 'Start',
    service: 'Leistung',
    industry: 'Branche',
    contact: 'Kontakt',
  };
}

function localeToPrimaryNavigationLabel(locale: string, appName: string): string {
  if (locale === 'en') {
    return `${appName} primary navigation`;
  }

  return `${appName} Hauptnavigation`;
}

function localeToMobileNavigationLabel(locale: string): string {
  if (locale === 'en') {
    return 'Mobile navigation';
  }

  return 'Mobile Navigation';
}

function localeToSeoTitle(locale: string): string {
  if (locale === 'en') {
    return 'Web Design for Palatinate Businesses | Pfalz Development';
  }

  if (locale === 'pfl') {
    return 'Webdesign in de Palz | Pfalz Development';
  }

  return 'Webdesign Pfalz für Unternehmen | Pfalz Development';
}

function localeToSeoLinksTitle(locale: string): string {
  if (locale === 'en') {
    return 'Industries in focus';
  }

  if (locale === 'pfl') {
    return 'Branche im Fokus';
  }

  return 'Branchen im Fokus';
}

function localeToSeoLinksCtaLabel(locale: string): string {
  if (locale === 'en') {
    return 'Open page';
  }

  if (locale === 'pfl') {
    return 'Seid uffmache';
  }

  return 'Seite öffnen';
}

function localeToSeoLinkItems(locale: string): SeoLinkItem[] {
  if (locale === 'en') {
    return [
      {
        label: 'Website for Holiday Rentals',
        href: '/branchen/ferienwohnung-website',
        description:
          'Industry page for hosts who want more direct and qualified booking inquiries.',
      },
      {
        label: 'Website for Restaurants',
        href: '/branchen/restaurant-website',
        description:
          'Industry page for restaurants focused on clear guest information and direct reservation inquiries.',
      },
      {
        label: 'Website for Wineries and Sparkling Wine Estates',
        href: '/branchen/weingut-sektgut-website',
        description:
          'Industry page for wine businesses with focus on events, tastings, and direct inquiries.',
      },
    ];
  }

  if (locale === 'pfl') {
    return [
      {
        label: 'Website fer Feriewohnunge',
        href: '/branchen/ferienwohnung-website',
        description:
          'Brancheseid fer Gaschdgewwer, die meh direkte un passendi Buchungsafrooche wolle.',
      },
      {
        label: 'Website fer Restaurants',
        href: '/branchen/restaurant-website',
        description:
          'Brancheseid fer Restaurants mit Fokus uff klare Gaste-Info un direkte Reservierungsaafrooche.',
      },
      {
        label: 'Website fer Winzer un Sekdgieder',
        href: '/branchen/weingut-sektgut-website',
        description:
          'Brancheseid fer Weinbetriewe mit Fokus uff Termine, Proobe un direkte Aafrooche.',
      },
    ];
  }

  return [
    {
      label: 'Website für Ferienwohnungen',
      href: '/branchen/ferienwohnung-website',
      description:
        'Branchenseite für Gastgeber, die mehr Direktanfragen statt Plattformabhängigkeit suchen.',
    },
    {
      label: 'Website für Restaurants',
      href: '/branchen/restaurant-website',
      description:
        'Branchenseite für Restaurants mit Fokus auf Reservierungsanfragen und klare Gäste-Kommunikation.',
    },
    {
      label: 'Website für Winzer und Sektgüter',
      href: '/branchen/weingut-sektgut-website',
      description:
        'Branchenseite für Weinbetriebe mit Fokus auf Weinproben, Veranstaltungen und Direktanfragen.',
    },
  ];
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common.home' });
  const canonicalPath = localeToPath(locale);
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;
  const seoTitle = localeToSeoTitle(locale);

  return {
    title: seoTitle,
    description: t('subheadline'),
    keywords: [
      'Website erstellen lassen Pfalz',
      'Webdesign Neustadt an der Weinstraße',
      'Webdesign Landau in der Pfalz',
      'Webentwickler Pfalz',
      'Homepage für Unternehmen Pfalz',
      'Website für Ferienwohnung Pfalz',
      'Website für Restaurant Pfalz',
      'Website für Weingut Pfalz',
      'Website für Sektgut Pfalz',
      'Webdesign Bad Dürkheim',
      'Webdesign Speyer',
      'Webdesign Ludwigshafen',
    ],
    alternates: {
      canonical: canonicalPath || '/',
      languages: {
        de: '/',
        en: '/en',
        [PALATINATE_HREFLANG]: '/pfl',
        'x-default': '/',
      },
    },
    openGraph: {
      type: 'website',
      locale: localeToOgLocale(locale),
      url: canonicalUrl,
      title: seoTitle,
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
      title: seoTitle,
      description: t('subheadline'),
      images: [siteConfig.ogImage],
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

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
  const basePath = localeToBasePath(locale);
  const homeHref = basePath || '/';
  const industryLabel = localeToIndustryLabel(locale);
  const mobileShortLabels = localeToMobileShortLabels(locale);
  const navItems = [
    { label: navT('home'), href: homeHref },
    { label: navT('about'), href: `${basePath}/leistungen` },
    {
      label: industryLabel,
      href: `${basePath}/branchen`,
    },
    { label: navT('contact'), href: `${homeHref}#kontakt` },
  ];
  const mobileNavItems = [
    {
      label: navT('home'),
      href: homeHref,
      shortLabel: mobileShortLabels.home,
    },
    {
      label: navT('about'),
      href: `${basePath}/leistungen`,
      shortLabel: mobileShortLabels.service,
    },
    {
      label: industryLabel,
      href: `${basePath}/branchen`,
      shortLabel: mobileShortLabels.industry,
    },
    {
      label: navT('contact'),
      href: `${homeHref}#kontakt`,
      shortLabel: mobileShortLabels.contact,
    },
  ];
  const canonicalPath = localeToPath(locale);
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;
  const inLanguage = localeToLanguageTag(locale);
  const primaryNavigationLabel = localeToPrimaryNavigationLabel(
    locale,
    t('appName')
  );
  const mobileNavigationLabel = localeToMobileNavigationLabel(locale);

  const pageData: HomePageData = {
    appName: t('appName'),
    accessibility: {
      skipToContentLabel: t('accessibility.skipToContent'),
      primaryNavigationLabel,
      mobileNavigationLabel,
    },
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
    seoLinks: {
      title: localeToSeoLinksTitle(locale),
      ctaLabel: localeToSeoLinksCtaLabel(locale),
      items: localeToSeoLinkItems(locale),
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
      note: t('home.packages.note'),
      supportNote: t('home.packages.supportNote'),
      detailsCta: t('home.packages.detailsCta'),
      modalIncludesTitle: t('home.packages.modalIncludesTitle'),
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
      openFormLabel: t('home.contact.form.openCta'),
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
    '@id': `${canonicalUrl}#professional-service`,
    name: siteConfig.name,
    inLanguage,
    url: canonicalUrl,
    email: 'kontakt@pfalz-development.de',
    telephone: '+4963211876643',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+4963211876643',
      email: 'kontakt@pfalz-development.de',
      contactType: 'customer support',
      areaServed: 'DE',
      availableLanguage: ['de', 'en', PALATINATE_HREFLANG],
    },
    sameAs: [siteConfig.links.github],
    areaServed: [
      'Neustadt an der Weinstraße',
      'Landau in der Pfalz',
      'Bad Dürkheim',
      'Speyer',
      'Ludwigshafen',
      'Pfalz',
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Fröbelstraße 20',
      postalCode: '67433',
      addressLocality: 'Neustadt an der Weinstraße',
      addressCountry: 'DE',
    },
    serviceType: [
      'Webdesign',
      'Webentwicklung',
      'Website Erstellung',
      'Website Wartung',
      'Hosting',
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}#website`,
    url: siteConfig.url,
    inLanguage,
    name: siteConfig.name,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage,
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
          __html: JSON.stringify(websiteSchema),
        }}
      />
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
