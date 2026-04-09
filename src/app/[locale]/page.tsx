import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HomePageView } from '@/components/home/HomePageView';
import { siteConfig } from '@/config/site';
import {
  getHeaderControlsCopy,
  getIndustryNavLabel,
  localeToBasePath,
} from '@/lib/locale-ui';
import { PALATINATE_HREFLANG } from '@/lib/seo';
import type {
  CardItem,
  ContactDetails,
  ContactFormCopy,
  FaqItem,
  HomePageData,
  PackageItem,
  SeoLinkItem,
  SupportedLocale,
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

function localeToPrimaryNavigationLabel(
  locale: string,
  appName: string
): string {
  if (locale === 'en') {
    return `${appName} primary navigation`;
  }

  return `${appName} Hauptnavigation`;
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

function localeToSeoDescription(locale: string): string {
  if (locale === 'en') {
    return 'Web design, development, relaunches, and website support for businesses in the Palatinate, including Neustadt, Landau, and the surrounding region.';
  }

  if (locale === 'pfl') {
    return 'Webdesign, Umsetzung, Relaunch un Website-Pflege fer Betriewe in de Palz, rund um Neustadt, Landau un die Region.';
  }

  return 'Webdesign, Website-Erstellung, Relaunch und laufende Betreuung für Unternehmen in der Pfalz, rund um Neustadt an der Weinstraße, Landau und Umgebung.';
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
          'For hosts who want more direct booking inquiries, clearer trust signals, and a stronger website presence beyond booking platforms.',
      },
      {
        label: 'Website for Restaurants',
        href: '/branchen/restaurant-website',
        description:
          'For restaurants that need clear guest information, strong mobile usability, and direct reservation inquiries through their own website.',
      },
      {
        label: 'Website for Wineries and Sparkling Wine Estates',
        href: '/branchen/weingut-sektgut-website',
        description:
          'For wineries and sparkling wine estates that want to present wines, tastings, events, and direct inquiries in a structured way.',
      },
    ];
  }

  if (locale === 'pfl') {
    return [
      {
        label: 'Website fer Feriewohnunge',
        href: '/branchen/ferienwohnung-website',
        description:
          'Fer Gaschdgewwer, die meh direkte Buchungsafrooche, klares Vertrauen un en staerkere eigne Online-Praesenz wolle.',
      },
      {
        label: 'Website fer Restaurants',
        href: '/branchen/restaurant-website',
        description:
          'Fer Restaurants mit Fokus uff klare Gaste-Info, gute Handy-Nutzbarkeit un direkte Reservierungsaafrooche.',
      },
      {
        label: 'Website fer Winzer un Sekdgieder',
        href: '/branchen/weingut-sektgut-website',
        description:
          'Fer Weinbetriewe, die Weine, Proobe, Termine un direkte Aafrooche uebersichtlich un professionell zeige wolle.',
      },
    ];
  }

  return [
    {
      label: 'Website für Ferienwohnungen',
      href: '/branchen/ferienwohnung-website',
      description:
        'Für Gastgeber, die mehr Direktanfragen, klare Vertrauenselemente und weniger Abhängigkeit von Buchungsplattformen möchten.',
    },
    {
      label: 'Website für Restaurants',
      href: '/branchen/restaurant-website',
      description:
        'Für Restaurants mit Fokus auf klare Gäste-Kommunikation, gute mobile Nutzung und direkte Reservierungsanfragen.',
    },
    {
      label: 'Website für Winzer und Sektgüter',
      href: '/branchen/weingut-sektgut-website',
      description:
        'Für Weinbetriebe mit Fokus auf Weinproben, Veranstaltungen, Produktdarstellung und direkte Anfragen über die eigene Website.',
    },
  ];
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = localeToPath(locale);
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;
  const seoTitle = localeToSeoTitle(locale);
  const seoDescription = localeToSeoDescription(locale);

  return {
    title: seoTitle,
    description: seoDescription,
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
      description: seoDescription,
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
      description: seoDescription,
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
  const contactFormCopy = t.raw('home.contact.form') as ContactFormCopy;
  const legalT = await getTranslations({ locale, namespace: 'legal' });
  const basePath = localeToBasePath(locale);
  const homeHref = basePath || '/';
  const industryLabel = getIndustryNavLabel(locale);
  const navItems = [
    { label: navT('home'), href: homeHref },
    { label: navT('about'), href: `${basePath}/leistungen` },
    {
      label: industryLabel,
      href: `${basePath}/branchen`,
    },
    { label: navT('contact'), href: `${homeHref}#kontakt` },
  ];
  const canonicalPath = localeToPath(locale);
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;
  const inLanguage = localeToLanguageTag(locale);
  const primaryNavigationLabel = localeToPrimaryNavigationLabel(
    locale,
    t('appName')
  );

  const pageData: HomePageData = {
    appName: t('appName'),
    locale: locale as SupportedLocale,
    accessibility: {
      skipToContentLabel: t('accessibility.skipToContent'),
      primaryNavigationLabel,
    },
    controls: getHeaderControlsCopy(locale),
    navItems,
    hero: {
      eyebrow: t('home.eyebrow'),
      headline: t('home.headline'),
      subheadline: t('home.subheadline'),
      primaryCta: t('home.primaryCta'),
      secondaryCta: t('home.secondaryCta'),
      trustTitle: t('home.trust.title'),
      trustItems,
    },
    introduction: {
      eyebrow: t('home.introduction.eyebrow'),
      title: t('home.introduction.title'),
      description: t('home.introduction.description'),
      points: t.raw('home.introduction.points') as string[],
      conclusion: t('home.introduction.conclusion'),
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
      privacyHref: `${basePath}/datenschutz`,
      form: contactFormCopy,
      details: contactDetails,
    },
    footer: {
      note: legalT('footerNote'),
      imprintLabel: legalT('imprint.title'),
      privacyLabel: legalT('privacy.title'),
      imprintHref: `${basePath}/impressum`,
      privacyHref: `${basePath}/datenschutz`,
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
