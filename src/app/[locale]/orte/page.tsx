import type { Metadata } from 'next';
import { HomeFooter } from '@/components/home/HomeFooter';
import { HomeHeader } from '@/components/home/HomeHeader';
import { PageSmoothScroll } from '@/components/ui/PageSmoothScroll';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';
import { SectionSpyNav } from '@/components/ui/SectionSpyNav';
import type { NavItem } from '@/components/home/types';
import { siteConfig } from '@/config/site';
import { getHeaderControlsCopy } from '@/lib/header-controls.server';
import { createPageMetadata, PALATINATE_HREFLANG } from '@/lib/seo';
import { buildWhatsAppHref } from '@/lib/whatsapp';
import { getTranslations, setRequestLocale } from 'next-intl/server';

interface OrtePageProps {
  params: Promise<{ locale: string }>;
}

const pathByLocale = {
  de: '/orte',
  en: '/en/orte',
  pfl: '/pfl/orte',
} as const;

type OrtePageCopy = {
  title: string;
  intro: string;
  highlight: string;
  navTitle: string;
  nav: {
    overview: string;
    logic: string;
    support: string;
  };
  overviewTitle: string;
  overviewText: string;
  logicTitle: string;
  logicText: string;
  logicPoints: string[];
  cards: Array<{
    badge: string;
    title: string;
    description: string;
    outcome: string;
    href: string;
  }>;
  cta: string;
  supportTitle: string;
  supportText: string;
  supportPrimaryLabel: string;
  supportSecondaryLabel: string;
};

function getPrimaryNavigationLabel(locale: string, appName: string): string {
  if (locale === 'en') {
    return `${appName} primary navigation`;
  }

  return `${appName} Hauptnavigation`;
}

function getOrteMetaTitle(locale: string): string {
  if (locale === 'en') {
    return 'Local Web Design Pages for Neustadt, Landau, and Speyer | Pfalz Development';
  }

  if (locale === 'pfl') {
    return 'Lokale Webdesign-Seide fer Neustadt, Landau un Speyer | Pfalz Development';
  }

  return 'Lokale Webdesign-Seiten für Neustadt, Landau und Speyer | Pfalz Development';
}

function getOrteMetaDescription(locale: string): string {
  if (locale === 'en') {
    return 'Location-specific web design pages for Neustadt an der Weinstrasse, Landau in der Pfalz, and Speyer with clear local relevance and direct paths to inquiry.';
  }

  if (locale === 'pfl') {
    return 'Lokale Webdesign-Seide fer Neustadt an de Weischdroß, Landau in de Palz un Speyer mit klarem Regionalbezug un direktem Weg zur Aafrooch.';
  }

  return 'Lokale Webdesign-Seiten für Neustadt an der Weinstraße, Landau in der Pfalz und Speyer mit klarem Regionalbezug und direktem Weg zur Anfrage.';
}

function getOrteCopy(locale: string): OrtePageCopy {
  if (locale === 'en') {
    return {
      title: 'Web Design for Neustadt, Landau, and Speyer',
      intro:
        'If your business is based in Neustadt an der Weinstrasse, Landau in der Pfalz, or Speyer, this is the right local entry point for your website project. The best page depends less on the map alone and more on the business context you want to emphasize.',
      highlight:
        'Choose the page that best fits your regional business context and use it as the shortest path toward a clearer offer, more trust, and better inquiries.',
      navTitle: 'Locations',
      nav: {
        overview: 'Location Overview',
        logic: 'Why It Fits',
        support: 'Next Step',
      },
      overviewTitle: 'Choose the local page that best fits your area',
      overviewText:
        'All three pages lead into the same core service, but each one sets a different focus: Neustadt is more regional and hospitality-adjacent, Landau is more dynamic and mobile-first, and Speyer is more trust- and credibility-driven.',
      logicTitle: 'Which local entry point fits your business context?',
      logicText:
        'The city matters, but the stronger differentiator is how your business is positioned. Choose the page that reflects the tone, audience, and decision pattern your customers are most likely to have.',
      logicPoints: [
        'Neustadt: a strong fit for hospitality, wine-related businesses, and regional service providers around the Weinstrasse',
        'Landau: a strong fit for retail, hospitality, and service businesses that need a more modern and mobile-first outward presence',
        'Speyer: a strong fit for established, advisory, or trust-driven businesses where credibility matters before contact happens',
      ],
      cards: [
        {
          badge: 'Location',
          title: 'Web Design Neustadt an der Weinstrasse',
          description:
            'For businesses around Neustadt and the Weinstrasse that need stronger regional trust and clearer positioning.',
          outcome:
            'Focus: hospitality-adjacent audiences, regional relevance, and a stronger trust-based first impression.',
          href: '/orte/webdesign-neustadt',
        },
        {
          badge: 'Location',
          title: 'Web Design Landau in der Pfalz',
          description:
            'For businesses in Landau that need a more modern outward presence and clearer mobile-first communication.',
          outcome:
            'Focus: retail, hospitality, services, and a faster, more contemporary first impression.',
          href: '/orte/webdesign-landau',
        },
        {
          badge: 'Location',
          title: 'Web Design Speyer',
          description:
            'For businesses in Speyer that need a more professional, trustworthy presence and a clearer path to qualified inquiries.',
          outcome:
            'Focus: credibility, clarity, and a more confidence-building path toward contact.',
          href: '/orte/webdesign-speyer',
        },
      ],
      cta: 'Open location page',
      supportTitle: 'Not sure which page is the better entry point?',
      supportText:
        'If you are unsure whether a city page or the broader service page is the better starting point, I can clarify that quickly based on your audience, offer, and local context.',
      supportPrimaryLabel: 'View all services',
      supportSecondaryLabel: 'Request consultation',
    };
  }

  if (locale === 'pfl') {
    return {
      title: 'Webdesign fer Neustadt, Landau un Speyer',
      intro:
        'Wenn dei Betrieb in Neustadt an de Weischdroß, Landau in de Palz oder Speyer sitzt, hosch hier de passende lokale Einstieg fer dei Website-Projekt. Welche Seid am beschde passt, hängt net nur vum Ort ab, sondern aa davo, wie dei Betrieb wirke soll.',
      highlight:
        'Such die Seid aus, die am beschde zu deim regionalen Geschäftsumfeld passt, un nutz sie als direkde Weg zu meh Klarheit, meh Vertraue un bessere Aafrooche.',
      navTitle: 'Orte',
      nav: {
        overview: 'Iwwersicht',
        logic: 'Warum des passt',
        support: 'Neggschder Schritt',
      },
      overviewTitle:
        'Wähle die lokale Seid, die am beschde zu deim Gebiet passt',
      overviewText:
        'All drei Seide führe ins gleiche Kernangebot, setze awer unterschiedliche Schwerpunkte: Neustadt eher regional un gastgebernah, Landau moderner un mobiler un Speyer stärker uff Vertrauen un Seriosität ausgericht.',
      logicTitle: 'Welcher lokale Einstieg passt zu deim Geschäftsumfeld?',
      logicText:
        'Die Stadt is wichtig, awer noch wichtiger is, wie dei Betrieb positioniert is. Such die Seid aus, die Ton, Zielgruppe un Entscheidungslogik vun deine Kunden am beschde trifft.',
      logicPoints: [
        'Neustadt: guut fer Gastgeber, Weinbetriebe un regionale Dinschdleischder rund um die Weischdroß',
        'Landau: guut fer Handel, Gastro un Dienste, die en moderneren un mobileren Uffedrit brauche',
        'Speyer: guut fer etablierte, beratende oder vertrauensgetriebene Betriewe, wo Glaubwürdigkeit vor de Kontakt zählt',
      ],
      cards: [
        {
          badge: 'Ort',
          title: 'Webdesign Neustadt an de Weischdroß',
          description:
            'Fer Betriewe rund um Neustadt un die Weischdroß, die meh regionales Vertraue un en klarere Positionierung brauche.',
          outcome:
            'Fokus: gastgebernahe Zielgruppe, regionale Relevanz un en stärkerer vertrauensbasierter erschter Eindruck.',
          href: '/orte/webdesign-neustadt',
        },
        {
          badge: 'Ort',
          title: 'Webdesign Landau in de Palz',
          description:
            'Fer Betriewe in Landau, die moderner wirke un mobil schneller verstanden werre müsse.',
          outcome:
            'Fokus: Handel, Gastro, Dienste un en schnellerer, zeitgemäßer erschter Eindruck.',
          href: '/orte/webdesign-landau',
        },
        {
          badge: 'Ort',
          title: 'Webdesign Speyer',
          description:
            'Fer Betriewe in Speyer, die professioneller, vertrauenswürdiger un klarer online wirke wolle.',
          outcome:
            'Fokus: Glaubwürdigkeit, Klarheit un en vertrauensvollerer Weg zur Kontaktaufnahme.',
          href: '/orte/webdesign-speyer',
        },
      ],
      cta: 'Ortsseid uffmache',
      supportTitle: 'Net sicher, welche Seid de bessere Einstieg is?',
      supportText:
        'Wenn du net sicher bisch, ob en Ortsseid oder direkt die allgemeine Leischdungsseid der bessere Anfang is, klär ich des schnell mit dir anhand vun Zielgruppe, Angebot un lokalem Umfeld.',
      supportPrimaryLabel: 'Alle Leischdunge aa gugge',
      supportSecondaryLabel: 'Berodung aafohre',
    };
  }

  return {
    title: 'Webdesign für Neustadt, Landau und Speyer',
    intro:
      'Wenn dein Unternehmen in Neustadt an der Weinstraße, Landau in der Pfalz oder Speyer sitzt, findest du hier den passenden lokalen Einstieg für dein Website-Projekt. Welche Seite am besten passt, hängt nicht nur von der Stadt ab, sondern auch davon, wie dein Unternehmen wahrgenommen werden soll.',
    highlight:
      'Wähle die Seite, die am besten zu deinem regionalen Geschäftsumfeld passt, und nutze sie als direkten Einstieg zu mehr Klarheit, Vertrauen und passenden Anfragen.',
    navTitle: 'Orte',
    nav: {
      overview: 'Orts-Überblick',
      logic: 'Warum das passt',
      support: 'Nächster Schritt',
    },
    overviewTitle:
      'Wähle die lokale Seite, die am besten zu deinem Gebiet passt',
    overviewText:
      'Alle drei Seiten führen in das gleiche Kernangebot, setzen aber unterschiedliche Schwerpunkte: Neustadt stärker regional und gastgebernah, Landau moderner und mobiler, Speyer stärker vertrauens- und seriösitätsgetrieben.',
    logicTitle: 'Welcher lokale Einstieg passt zu deinem Geschäftsumfeld?',
    logicText:
      'Die Stadt ist wichtig, aber noch wichtiger ist, wie dein Unternehmen positioniert ist. Wähle die Seite, die Tonalität, Zielgruppe und Entscheidungslogik deiner Kunden am besten trifft.',
    logicPoints: [
      'Neustadt: passend für Gastgeber, Weinbetriebe und regionale Dienstleister rund um die Weinstraße',
      'Landau: passend für Handel, Gastronomie und Services mit modernerem, mobilem Publikum',
      'Speyer: passend für etablierte, beratende oder vertrauensgetriebene Angebote',
    ],
    cards: [
      {
        badge: 'Ort',
        title: 'Webdesign Neustadt an der Weinstraße',
        description:
          'Für Unternehmen rund um Neustadt und die Weinstraße, die regional mehr Vertrauen und eine klarere Positionierung brauchen.',
        outcome:
          'Fokus: gastgebernahe Zielgruppen, regionale Relevanz und ein stärkerer vertrauensbasierter Ersteindruck.',
        href: '/orte/webdesign-neustadt',
      },
      {
        badge: 'Ort',
        title: 'Webdesign Landau in der Pfalz',
        description:
          'Für Unternehmen in Landau, die moderner auftreten und mobil schneller verstanden werden möchten.',
        outcome:
          'Fokus: Handel, Gastronomie, Services und ein schnellerer, zeitgemäßer erster Eindruck.',
        href: '/orte/webdesign-landau',
      },
      {
        badge: 'Ort',
        title: 'Webdesign Speyer',
        description:
          'Für Unternehmen in Speyer, die professioneller, vertrauenswürdiger und klarer online wirken möchten.',
        outcome:
          'Fokus: Glaubwürdigkeit, Klarheit und ein vertrauensvollerer Weg zur Kontaktaufnahme.',
        href: '/orte/webdesign-speyer',
      },
    ],
    cta: 'Ortsseite öffnen',
    supportTitle: 'Noch unsicher, welche Seite der richtige Einstieg ist?',
    supportText:
      'Wenn du unsicher bist, ob eine Ortsseite oder direkt die allgemeine Leistungsseite der bessere Startpunkt ist, kläre ich das mit dir anhand von Zielgruppe, Angebot und lokalem Umfeld.',
    supportPrimaryLabel: 'Alle Leistungen ansehen',
    supportSecondaryLabel: 'Erstberatung anfragen',
  };
}

export async function generateMetadata({
  params,
}: OrtePageProps): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath =
    pathByLocale[locale as keyof typeof pathByLocale] ?? pathByLocale.de;

  return createPageMetadata({
    locale,
    canonicalPath,
    languages: {
      de: pathByLocale.de,
      en: pathByLocale.en,
      [PALATINATE_HREFLANG]: pathByLocale.pfl,
      'x-default': pathByLocale.de,
    },
    title: getOrteMetaTitle(locale),
    description: getOrteMetaDescription(locale),
  });
}

export default async function OrtePage({ params }: OrtePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const navT = await getTranslations({ locale, namespace: 'navigation' });
  const legalT = await getTranslations({ locale, namespace: 'legal' });
  const commonT = await getTranslations({ locale, namespace: 'common' });
  const footerWhatsAppHref = buildWhatsAppHref(
    siteConfig.contact.whatsAppDisplay,
    commonT('home.contact.whatsAppMessage')
  );
  const copy = getOrteCopy(locale);

  const basePath = locale === 'de' ? '' : `/${locale}`;
  const homeHref = basePath || '/';
  const primaryNavigationLabel = getPrimaryNavigationLabel(
    locale,
    siteConfig.name
  );

  const navItems: NavItem[] = [
    { label: navT('home'), href: homeHref },
    { label: navT('about'), href: `${basePath}/leistungen` },
    {
      label: locale === 'en' ? 'Industry' : 'Branche',
      href: `${basePath}/branchen`,
    },
    { label: navT('contact'), href: `${homeHref}#kontakt` },
  ];

  const sectionLinks = [
    { href: '#ueberblick', label: copy.nav.overview },
    { href: '#logik', label: copy.nav.logic },
    { href: '#support', label: copy.nav.support },
  ];
  const headerControls = await getHeaderControlsCopy(locale);

  return (
    <div className="surface-page flex min-h-screen flex-col">
      <PageSmoothScroll />
      <HomeHeader
        appName={siteConfig.name}
        navItems={navItems}
        brandHref={homeHref}
        navAriaLabel={primaryNavigationLabel}
        controls={headerControls}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 sm:px-6 md:pb-16 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px] xl:gap-12">
          <aside className="hidden lg:col-start-2 lg:row-start-1 lg:block lg:self-start">
            <SectionSpyNav
              title={copy.navTitle}
              items={sectionLinks}
              className="surface-section-muted rounded-2xl border border-stone-200/80 p-4 backdrop-blur-sm dark:border-stone-700 dark:bg-stone-900/35 lg:fixed lg:right-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))] lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:w-[240px] lg:overflow-auto"
            />
          </aside>

          <div className="pt-28 sm:pt-32 lg:col-start-1 lg:row-start-1">
            <RevealOnScroll as="section" className="pt-2 sm:pt-4">
              <div className="surface-hero relative overflow-hidden rounded-[2rem] border border-stone-200/80 px-5 py-7 shadow-[0_24px_70px_rgba(28,25,23,0.08)] dark:border-stone-700/80 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
                <div className="bg-amber-500/12 pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full blur-3xl" />
                <div className="relative pl-1 sm:pl-2 lg:pl-4">
                  <h1 className="max-w-5xl pl-[0.28em] -indent-[0.28em] text-4xl font-black tracking-tight text-stone-950 [text-wrap:balance] dark:text-stone-50 sm:text-5xl lg:text-6xl">
                    {copy.title}
                  </h1>
                  <p className="mt-5 max-w-3xl text-base leading-7 text-stone-700 dark:text-stone-200 sm:text-lg">
                    {copy.intro}
                  </p>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600 dark:text-stone-300 sm:text-base">
                    {copy.highlight}
                  </p>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll
              as="section"
              id="ueberblick"
              delayMs={80}
              className="mt-20 scroll-mt-28 border-t border-stone-200/70 pt-14 dark:border-stone-700/70 sm:mt-24 sm:pt-16"
            >
              <div className="max-w-4xl">
                <h2 className="text-2xl font-black tracking-tight text-stone-950 dark:text-stone-50 sm:text-3xl">
                  {copy.overviewTitle}
                </h2>
                <p className="mt-3 text-sm leading-7 text-stone-700 dark:text-stone-200 sm:text-base">
                  {copy.overviewText}
                </p>
              </div>
              <div className="card-grid-balance-md-xl mt-8 grid gap-4 [--card-grid-gap:1rem] md:grid-cols-2 xl:grid-cols-3">
                {copy.cards.map((card, index) => (
                  <RevealOnScroll
                    as="article"
                    key={card.href}
                    delayMs={120 + index * 60}
                    className="flex h-full flex-col rounded-[1.35rem] border border-stone-200/90 bg-stone-50/95 p-5 shadow-[0_12px_26px_rgba(28,25,23,0.05)] dark:border-stone-700 dark:bg-stone-800/65"
                  >
                    <p className="inline-flex rounded-full border border-amber-300/70 bg-amber-100/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900 dark:border-amber-300/40 dark:bg-amber-300/10 dark:text-amber-200">
                      {card.badge}
                    </p>
                    <h3 className="mt-3 text-lg font-bold text-stone-950 dark:text-stone-50">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-stone-700 dark:text-stone-200">
                      {card.description}
                    </p>
                    <p className="mt-4 text-sm leading-6 text-stone-600 dark:text-stone-300">
                      {card.outcome}
                    </p>
                    <a
                      href={`${basePath}${card.href}`}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-amber-800 transition hover:text-amber-700 dark:text-amber-200 dark:hover:text-amber-100"
                    >
                      {copy.cta}
                      <span aria-hidden="true">-&gt;</span>
                    </a>
                  </RevealOnScroll>
                ))}
              </div>
            </RevealOnScroll>

            <RevealOnScroll
              as="section"
              id="logik"
              delayMs={140}
              className="bg-white/82 mt-20 scroll-mt-28 rounded-[1.75rem] border border-stone-200/80 p-6 dark:border-stone-700/75 dark:bg-stone-900/45 sm:p-8"
            >
              <h2 className="text-2xl font-black tracking-tight text-stone-950 dark:text-stone-50 sm:text-3xl">
                {copy.logicTitle}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-700 dark:text-stone-200 sm:text-base">
                {copy.logicText}
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-3">
                {copy.logicPoints.map((point) => (
                  <li
                    key={point}
                    className="rounded-xl border border-stone-200/80 bg-stone-50/85 px-4 py-3 text-sm leading-6 text-stone-800 dark:border-stone-700/75 dark:bg-stone-800/60 dark:text-stone-200"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </RevealOnScroll>

            <RevealOnScroll
              as="section"
              id="support"
              delayMs={180}
              className="surface-contact mt-16 rounded-[1.75rem] p-6 text-stone-50 sm:p-8"
            >
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                {copy.supportTitle}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-100/90 sm:text-base">
                {copy.supportText}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`${basePath}/leistungen`}
                  className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-300"
                >
                  {copy.supportPrimaryLabel}
                </a>
                <a
                  href={`${homeHref}#kontakt`}
                  className="inline-flex items-center justify-center rounded-full border border-stone-300/30 bg-white/10 px-6 py-3 text-sm font-semibold text-stone-50 transition hover:bg-white/15"
                >
                  {copy.supportSecondaryLabel}
                </a>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </main>

      <HomeFooter
        note={legalT('footerNote')}
        imprintLabel={legalT('imprint.title')}
        privacyLabel={legalT('privacy.title')}
        whatsAppLabel={legalT('footerWhatsAppCta')}
        whatsAppHref={footerWhatsAppHref}
        imprintHref={`${basePath}/impressum`}
        privacyHref={`${basePath}/datenschutz`}
      />
    </div>
  );
}
