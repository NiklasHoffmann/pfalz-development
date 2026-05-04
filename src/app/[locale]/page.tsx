import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HomePageView } from '@/components/home/HomePageView';
import { siteConfig } from '@/config/site';
import { getIndustryNavLabel, localeToBasePath } from '@/lib/locale-ui';
import { getHeaderControlsCopy } from '@/lib/header-controls.server';
import { PALATINATE_HREFLANG } from '@/lib/seo';
import { isTurnstileEnabled } from '@/lib/turnstile';
import { buildWhatsAppHref } from '@/lib/whatsapp';
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
    return 'Web Design in the Palatinate for Local Businesses | Pfalz Development';
  }

  if (locale === 'pfl') {
    return 'Webdesign in de Palz fer Betriewe | Pfalz Development';
  }

  return 'Webdesign Pfalz | Homepage erstellen lassen für Unternehmen';
}

function localeToSeoDescription(locale: string): string {
  if (locale === 'en') {
    return 'Web design for local businesses in the Palatinate with clear positioning, local SEO foundations, fixed packages, and direct contact via email, phone, WhatsApp, or form.';
  }

  if (locale === 'pfl') {
    return 'Webdesign fer Betriewe in de Palz mit klare Positionierung, lokale SEO-Grundlage, feste Pakede un direktem Kontakt per Mail, Telefon, WhatsApp odder Formular.';
  }

  return 'Webdesign und Website-Erstellung für Unternehmen in der Pfalz mit lokalen SEO-Grundlagen, klaren Paketen und direktem Kontakt per E-Mail, Telefon, WhatsApp oder Formular.';
}

function localeToIntroductionPortraitAlt(locale: string, name: string): string {
  if (locale === 'en') {
    return `Portrait of ${name}, founder of ${siteConfig.name}`;
  }

  if (locale === 'pfl') {
    return `Portraet vun ${name} vun ${siteConfig.name}`;
  }

  return `Porträt von ${name} von ${siteConfig.name}`;
}

function resolveIntroductionPortrait(
  locale: string
): HomePageData['introduction']['portrait'] {
  const preferredExtensions = ['.avif', '.webp', '.jpg', '.jpeg', '.png'];
  const portraitDirectory = path.join(
    process.cwd(),
    'public',
    'images',
    'portrait'
  );

  if (!existsSync(portraitDirectory)) {
    return undefined;
  }

  const portraitFiles = readdirSync(portraitDirectory, {
    withFileTypes: true,
  })
    .filter((entry) => entry.isFile())
    .map((entry) => ({
      entry,
      extension: path.extname(entry.name).toLowerCase(),
    }))
    .filter(({ extension }) => preferredExtensions.includes(extension))
    .sort(
      (left, right) =>
        preferredExtensions.indexOf(left.extension) -
        preferredExtensions.indexOf(right.extension)
    );

  const portraitFile = portraitFiles[0]?.entry;

  if (!portraitFile) {
    return undefined;
  }

  return {
    src: `/images/portrait/${portraitFile.name}`,
    alt: localeToIntroductionPortraitAlt(locale, siteConfig.creator.name),
    name: siteConfig.creator.name,
    label: siteConfig.name,
  };
}

function withLocaleBasePath(basePath: string, href: string): string {
  if (!href.startsWith('/')) {
    return href;
  }

  return `${basePath}${href}`;
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

function localeToSeoLinkItems(locale: string, basePath: string): SeoLinkItem[] {
  if (locale === 'en') {
    return [
      {
        label: 'Website for Holiday Rentals',
        href: withLocaleBasePath(basePath, '/branchen/ferienwohnung-website'),
        description:
          'For hosts who want more direct booking inquiries, clearer trust signals, and a stronger website presence beyond booking platforms.',
      },
      {
        label: 'Website for Restaurants',
        href: withLocaleBasePath(basePath, '/branchen/restaurant-website'),
        description:
          'For restaurants that need clear guest information, strong mobile usability, and direct reservation inquiries through their own website.',
      },
      {
        label: 'Website for Wineries and Sparkling Wine Estates',
        href: withLocaleBasePath(basePath, '/branchen/weingut-sektgut-website'),
        description:
          'For wineries and sparkling wine estates that want to present wines, tastings, events, and direct inquiries in a structured way.',
      },
    ];
  }

  if (locale === 'pfl') {
    return [
      {
        label: 'Website fer Feriewohnunge',
        href: withLocaleBasePath(basePath, '/branchen/ferienwohnung-website'),
        description:
          'Fer Gaschdgewwer, die meh direkte Buchungsafrooche, klares Vertrauen un en staerkere eigne Online-Praesenz wolle.',
      },
      {
        label: 'Website fer Restaurants',
        href: withLocaleBasePath(basePath, '/branchen/restaurant-website'),
        description:
          'Fer Restaurants mit Fokus uff klare Gaste-Info, gute Handy-Nutzbarkeit un direkte Reservierungsaafrooche.',
      },
      {
        label: 'Website fer Winzer un Sekdgieder',
        href: withLocaleBasePath(basePath, '/branchen/weingut-sektgut-website'),
        description:
          'Fer Weinbetriewe, die Weine, Proobe, Termine un direkte Aafrooche übersichtlich un professionell zeige wolle.',
      },
    ];
  }

  return [
    {
      label: 'Website für Ferienwohnungen',
      href: withLocaleBasePath(basePath, '/branchen/ferienwohnung-website'),
      description:
        'Für Gastgeber, die mehr Direktanfragen, klare Vertrauenselemente und weniger Abhängigkeit von Buchungsplattformen möchten.',
    },
    {
      label: 'Website für Restaurants',
      href: withLocaleBasePath(basePath, '/branchen/restaurant-website'),
      description:
        'Für Restaurants mit Fokus auf klare Gäste-Kommunikation, gute mobile Nutzung und direkte Reservierungsanfragen.',
    },
    {
      label: 'Website für Winzer und Sektgüter',
      href: withLocaleBasePath(basePath, '/branchen/weingut-sektgut-website'),
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
      'Webdesign Pfalz',
      'Webdesigner Pfalz',
      'Website erstellen lassen Pfalz',
      'Homepage erstellen Neustadt an der Weinstraße',
      'Webdesign Neustadt an der Weinstraße',
      'Webdesign Landau in der Pfalz',
      'Webentwickler Pfalz',
      'Homepage für Unternehmen Pfalz',
      'Website für Handwerker Pfalz',
      'Website für Ferienwohnung Pfalz',
      'Website für Restaurant Pfalz',
      'Website für Weingut Pfalz',
      'Website für Sektgut Pfalz',
      'Lokale SEO Pfalz',
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
  const basePath = localeToBasePath(locale);
  const whyMeItems = t.raw('home.whyMe.items') as string[];
  const packageItems = t.raw('home.packages.items') as PackageItem[];
  const processSteps = t.raw('home.process.steps') as string[];
  const faqItems = t.raw('home.faq.items') as FaqItem[];
  const contactDetails = t.raw('home.contact') as ContactDetails;
  const contactFormCopy = t.raw('home.contact.form') as ContactFormCopy;
  const legalT = await getTranslations({ locale, namespace: 'legal' });
  const hasProtectedContactReveal = isTurnstileEnabled();
  const resolvedContactDetails: ContactDetails = {
    ...contactDetails,
    ownerName: siteConfig.creator.name,
    emailValue: hasProtectedContactReveal ? '' : siteConfig.contact.email,
    phoneValue: hasProtectedContactReveal
      ? ''
      : siteConfig.contact.phoneDisplay,
    whatsAppValue: hasProtectedContactReveal
      ? ''
      : siteConfig.contact.whatsAppDisplay,
  };
  const footerWhatsAppHref = buildWhatsAppHref(
    siteConfig.contact.whatsAppDisplay,
    t('home.contact.whatsAppMessage')
  );
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
  const seoDescription = localeToSeoDescription(locale);
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
    controls: await getHeaderControlsCopy(locale),
    navItems,
    hero: {
      eyebrow: t('home.eyebrow'),
      headline: t('home.headline'),
      subheadline: t('home.subheadline'),
      primaryCta: t('home.primaryCta'),
      secondaryCta: t('home.secondaryCta'),
      secondaryCtaHref: `${basePath}/leistungen`,
      trustTitle: t('home.trust.title'),
      trustItems,
    },
    introduction: {
      eyebrow: t('home.introduction.eyebrow'),
      title: t('home.introduction.title'),
      description: t('home.introduction.description'),
      points: t.raw('home.introduction.points') as string[],
      conclusion: t('home.introduction.conclusion'),
      portrait: resolveIntroductionPortrait(locale),
    },
    services: {
      title: t('home.services.title'),
      items: serviceItems,
    },
    seoLinks: {
      title: localeToSeoLinksTitle(locale),
      ctaLabel: localeToSeoLinksCtaLabel(locale),
      items: localeToSeoLinkItems(locale, basePath),
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
      tertiaryCta: t('home.contact.tertiaryCta'),
      openFormLabel: t('home.contact.form.openCta'),
      revealEnabled: hasProtectedContactReveal,
      whatsAppMessage: t('home.contact.whatsAppMessage'),
      privacyHref: `${basePath}/datenschutz`,
      form: contactFormCopy,
      emailReveal: {
        title: t('home.contact.emailReveal.title'),
        description: t('home.contact.emailReveal.description'),
        verifyCta: t('home.contact.emailReveal.verifyCta'),
        openMailCta: t('home.contact.emailReveal.openMailCta'),
        loading: t('home.contact.emailReveal.loading'),
        success: t('home.contact.emailReveal.success'),
        unavailable: t('home.contact.emailReveal.unavailable'),
      },
      details: resolvedContactDetails,
    },
    footer: {
      note: legalT('footerNote'),
      imprintLabel: legalT('imprint.title'),
      privacyLabel: legalT('privacy.title'),
      whatsAppLabel: legalT('footerWhatsAppCta'),
      whatsAppHref: hasProtectedContactReveal ? undefined : footerWhatsAppHref,
      imprintHref: `${basePath}/impressum`,
      privacyHref: `${basePath}/datenschutz`,
    },
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${canonicalUrl}#professional-service`,
    name: siteConfig.name,
    description: seoDescription,
    slogan: t('home.subheadline'),
    inLanguage,
    url: canonicalUrl,
    image: `${siteConfig.url}${siteConfig.ogImage}`,
    priceRange: 'EUR 1,090+',
    ...(hasProtectedContactReveal
      ? {}
      : {
          email: siteConfig.contact.email,
          telephone: siteConfig.contact.phoneHref,
        }),
    founder: {
      '@type': 'Person',
      name: siteConfig.creator.name,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${canonicalUrl}#kontakt`,
      areaServed: 'DE',
      availableLanguage: ['de', 'en', PALATINATE_HREFLANG],
      ...(hasProtectedContactReveal
        ? {}
        : {
            email: siteConfig.contact.email,
            telephone: siteConfig.contact.phoneHref,
          }),
    },
    sameAs: [siteConfig.links.github],
    areaServed: [
      {
        '@type': 'AdministrativeArea',
        name: 'Pfalz',
      },
      {
        '@type': 'City',
        name: 'Neustadt an der Weinstraße',
      },
      {
        '@type': 'City',
        name: 'Landau in der Pfalz',
      },
      {
        '@type': 'City',
        name: 'Bad Dürkheim',
      },
      {
        '@type': 'City',
        name: 'Speyer',
      },
      {
        '@type': 'City',
        name: 'Ludwigshafen',
      },
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
    knowsAbout: [
      'Webdesign Pfalz',
      'Homepage für kleine Unternehmen',
      'Lokale SEO Grundlagen',
      'Ferienwohnungen',
      'Restaurants',
      'Weingüter',
      'Handwerksbetriebe',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: t('home.packages.title'),
      itemListElement: packageItems.map((item) => ({
        '@type': 'Offer',
        name: item.name,
        description: item.description,
        priceCurrency: 'EUR',
        url: `${canonicalUrl}#preise`,
        itemOffered: {
          '@type': 'Service',
          name: item.name,
        },
      })),
    },
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
