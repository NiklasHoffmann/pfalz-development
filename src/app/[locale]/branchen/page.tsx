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
import { isTurnstileEnabled } from '@/lib/turnstile';
import { buildWhatsAppHref } from '@/lib/whatsapp';
import { getTranslations, setRequestLocale } from 'next-intl/server';

interface BranchenPageProps {
  params: Promise<{ locale: string }>;
}

const pathByLocale = {
  de: '/branchen',
  en: '/en/branchen',
  pfl: '/pfl/branchen',
} as const;

type BranchenPageCopy = {
  title: string;
  intro: string;
  highlight: string;
  navTitle: string;
  nav: {
    grid: string;
    playbook: string;
    support: string;
  };
  gridTitle: string;
  gridText: string;
  playbookTitle: string;
  playbookText: string;
  playbookLabels: {
    scenario: string;
    focus: string;
    result: string;
  };
  processTitle: string;
  processSteps: string[];
  cards: Array<{
    badge: string;
    title: string;
    description: string;
    outcome: string;
    href: string;
    scenario: string[];
    focus: string[];
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

function getBranchenMetaTitle(locale: string): string {
  if (locale === 'en') {
    return 'Industry Websites for Holiday Rentals, Restaurants, and Wineries | Pfalz Development';
  }

  if (locale === 'pfl') {
    return 'Branche-Websites fer Gastgeber, Restaurants un Winzer | Pfalz Development';
  }

  return 'Branchen-Websites für Ferienwohnungen, Restaurants und Weingüter | Pfalz Development';
}

function getBranchenMetaDescription(locale: string): string {
  if (locale === 'en') {
    return 'Industry-specific websites for holiday rentals, restaurants, wineries, and similar businesses in the Palatinate with clear structure, trust signals, and qualified inquiry paths.';
  }

  if (locale === 'pfl') {
    return 'Branche-Websites fer Gastgeber, Restaurants, Winzer un ähnliche Betriewe in de Palz mit klarer Struktur, Vertrauen un passendem Aafrooch-Weg.';
  }

  return 'Branchenspezifische Websites für Ferienwohnungen, Restaurants, Winzer und ähnliche Betriebe in der Pfalz mit klarer Struktur, Vertrauen und qualifizierten Anfragewegen.';
}

function getBranchenCopy(locale: string): BranchenPageCopy {
  if (locale === 'en') {
    return {
      title: 'Industry Pages in the Palatinate',
      intro:
        'Choose the industry page that fits your business. Clear structure, trust, and inquiry-focused user flow included.',
      highlight:
        'No generic templates: each page is aligned to your market and implemented end to end.',
      navTitle: 'Industry',
      nav: {
        grid: 'Industry Overview',
        playbook: 'Playbooks',
        support: 'Support',
      },
      gridTitle: 'Choose your industry route',
      gridText:
        'Use the overview to jump directly to the page that matches your business model and inquiry goals.',
      playbookTitle:
        'Each industry follows a standardized performance playbook',
      playbookText:
        'You get a comparable setup quality across industries while keeping wording, trust elements, and CTA logic market-specific.',
      playbookLabels: {
        scenario: 'Typical Scenario',
        focus: 'Focus Areas',
        result: 'Expected Result',
      },
      processTitle: 'What all industry pages include',
      processSteps: [
        'Audience-specific page structure',
        'Clear offer messaging and trust elements',
        'Fast mobile experience and SEO basics',
        'Contact flow focused on qualified inquiries',
      ],
      cards: [
        {
          badge: 'Hospitality',
          title: 'Holiday Rentals',
          description:
            'For hosts who want more direct booking inquiries and less platform dependency.',
          outcome:
            'Goal: a stronger direct channel with clear accommodation positioning and frictionless inquiry flow.',
          href: '/branchen/ferienwohnung-website',
          scenario: [
            'Many inquiries happen via platforms instead of your own website.',
            'Guests lack quick trust signals and contact options.',
          ],
          focus: [
            'Direct-booking flow with clear accommodation highlights',
            'Trust section with location, amenities, and host credibility',
            'Fast mobile path to inquiry for short decision cycles',
          ],
        },
        {
          badge: 'Gastronomy',
          title: 'Restaurants',
          description:
            'For restaurant businesses that need clear guest information and direct reservation inquiries.',
          outcome:
            'Goal: faster guest decisions through clear menu, opening hours, and direct reservation paths.',
          href: '/branchen/restaurant-website',
          scenario: [
            'Guests leave because opening times, menu, or reservation path are unclear.',
            'Contact opportunities are hidden on mobile screens.',
          ],
          focus: [
            'Straight navigation to menu, location, and booking/reach-out',
            'Readable structure for fast evening and weekend searches',
            'Clear reservation CTA hierarchy across all key sections',
          ],
        },
        {
          badge: 'Wine Business',
          title: 'Winegrowers, Wineries, and Sparkling Wine Estates',
          description:
            'For wine businesses that want to present wines, events, and direct contact in a clear flow.',
          outcome:
            'Goal: clearer product communication and better inquiry quality for visits, events, and sales.',
          href: '/branchen/weingut-sektgut-website',
          scenario: [
            'Product communication is strong offline but unclear on the website.',
            'Visits, events, and direct sales inquiries are mixed and hard to route.',
          ],
          focus: [
            'Separated user paths for tasting, events, and purchase interest',
            'Clear product and estate story for trust and positioning',
            'Contact flow that pre-qualifies requests by intent',
          ],
        },
      ],
      cta: 'Open industry page',
      supportTitle: 'Not sure which page fits best?',
      supportText:
        'If needed, I define the best structure with you in a short scoping call and implement it directly.',
      supportPrimaryLabel: 'View all services',
      supportSecondaryLabel: 'Request consultation',
    };
  }

  if (locale === 'pfl') {
    return {
      title: 'Branche-Seide in de Palz',
      intro:
        'Such die Branche-Seid aus, die zu deim Gschaeft passt: klarer Aufbau, Vertrauen un direkter Aafrooch-Weg.',
      highlight:
        'Keen Standard-Vorlage, sondern saubere Umsetzung passend zu deim Markt.',
      navTitle: 'Branche',
      nav: {
        grid: 'Branche-Iwwersicht',
        playbook: 'Playbook',
        support: 'Support',
      },
      gridTitle: 'Wähle de passende Branche-Weg',
      gridText:
        'Mit de Iwwersicht kummersch direkt zur Seid, die zu deim Gschaeft un deim Anfrage-Ziel passt.',
      playbookTitle: 'Jede Branche kriegt en klares Umsetzungs-Playbook',
      playbookText:
        'Die Grundqualität bleibt gleich hoch, während Sprache, Vertrauen un CTA auf de Markt angepasst werre.',
      playbookLabels: {
        scenario: 'Typische Ausgangslage',
        focus: 'Schwerpunkt',
        result: 'Erwartets Ergebnis',
      },
      processTitle: 'Was in all Branche-Seide drin is',
      processSteps: [
        'Zielgruppe-gerechte Seidestruktur',
        'Klare Angebotsbotschaft un Vertrauen',
        'Schnelle mobile Darstellung un gute Google-Grundlage',
        'Kontaktweg fer passendi Aafrooche',
      ],
      cards: [
        {
          badge: 'Gastgewerbe',
          title: 'Feriewohnunge',
          description:
            'Fer Gaschdgewwer, die meh direkte Buchungsafrooche un wenischer Plattform-Abhängigkeit wolle.',
          outcome:
            'Ziel: en starker direkter Kanal mit klarer Positionierung un einfachem Aafrooch-Ablauf.',
          href: '/branchen/ferienwohnung-website',
          scenario: [
            'Viel Anfrage laafe über Plattform statt über dei Seid.',
            'Vertrauen un Kontaktweg sinn net direkt sichtbar.',
          ],
          focus: [
            'Direktbuchungs-Weg mit klare Unterkunfts-Highlights',
            'Vertrauensbereich mit Lage, Ausstattung un Gastgeber-Profil',
            'Schneller Handy-Weg bis zur Anfrage',
          ],
        },
        {
          badge: 'Gastronomie',
          title: 'Restaurants',
          description:
            'Fer Restaurants mit klare Gaste-Infos un direkte Reservierungsaafrooche.',
          outcome:
            'Ziel: schnellere Entscheedung fer Gäschte durch klare Infos un direkte Reservierungswege.',
          href: '/branchen/restaurant-website',
          scenario: [
            'Gäschte finne Öffnungszeiten, Karte odder Reservierung net schnell genug.',
            'Uf em Handy gehn Kontaktmöglichkeiten unter.',
          ],
          focus: [
            'Direkte Navigation zu Karte, Lage un Reservierung',
            'Lesbare Struktur fer spontane Suche am Owend',
            'Klare CTA-Hierarchie uff all wichtige Abschnitte',
          ],
        },
        {
          badge: 'Weinbetrieb',
          title: 'Winzer, Woigieder un Sekdgieder',
          description:
            'Fer Weinbetriewe, die Weine, Termine un Kontakt klar un übersichtlich zeige wolle.',
          outcome:
            'Ziel: bessere Produktkommunikation un passendi Aafrooche zu Besuch, Termin un Verkauf.',
          href: '/branchen/weingut-sektgut-website',
          scenario: [
            'Sortiment un Hofprofil sinn offline stark, online awer unklar.',
            'Aafrooche zu Besuch, Termin un Kauf laafe durcheinanner.',
          ],
          focus: [
            'Getrennte Wege fer Probe, Termin un Kaufinteresse',
            'Klare Produkt- un Betriebsdarstellung fer Vertrauen',
            'Kontaktweg mit Vorqualifizierung no Anliegen',
          ],
        },
      ],
      cta: 'Brancheseid uffmache',
      supportTitle: 'Net sicher, was am beschde passt?',
      supportText:
        'Wenn du willsch, klär ich die passende Struktur in eme kurze Scoping-Gespräch un setz sie direkt um.',
      supportPrimaryLabel: 'Alle Leischdunge aa gugge',
      supportSecondaryLabel: 'Berodung aafohre',
    };
  }

  return {
    title: 'Branchen-Seiten in der Pfalz',
    intro:
      'Wähle die Branchen-Seite, die zu deinem Geschäft passt: klar aufgebaut, vertrauensstark und anfrageorientiert.',
    highlight:
      'Keine Standard-Vorlage, sondern eine branchengerechte Umsetzung mit klarer Botschaft und moderner Technik.',
    navTitle: 'Branchen',
    nav: {
      grid: 'Branchen-Überblick',
      playbook: 'Playbooks',
      support: 'Unterstützung',
    },
    gridTitle: 'Wähle den passenden Branchenweg',
    gridText:
      'Über den Überblick springst du direkt zur passenden Seite für dein Geschäftsmodell und deine Anfrageziele.',
    playbookTitle: 'Jede Branche folgt einem klaren Performance-Playbook',
    playbookText:
      'Der Qualitätsstandard bleibt in allen Branchen gleich hoch, während Sprache, Vertrauenselemente und CTA-Logik individuell angepasst werden.',
    playbookLabels: {
      scenario: 'Typische Ausgangslage',
      focus: 'Fokus in der Umsetzung',
      result: 'Erwartbares Ergebnis',
    },
    processTitle: 'Was alle Branchen-Seiten gemeinsam haben',
    processSteps: [
      'Seitenaufbau passend zur Zielgruppe',
      'Klare Leistungsdarstellung und Vertrauen',
      'Schnelle mobile Nutzung plus gute Google-Grundlage',
      'Einfacher Kontaktweg für passende Anfragen',
    ],
    cards: [
      {
        badge: 'Gastgeber',
        title: 'Ferienwohnungen',
        description:
          'Für Gastgeber, die mehr Direktbuchungsanfragen und weniger Plattformabhängigkeit wollen.',
        outcome:
          'Ziel: ein starker Direktkanal mit klarer Darstellung deiner Unterkunft und einfachem Anfrageweg.',
        href: '/branchen/ferienwohnung-website',
        scenario: [
          'Viele Buchungsanfragen laufen über Plattformen statt über die eigene Website.',
          'Vertrauen und Kontaktmöglichkeit sind auf der Seite nicht klar priorisiert.',
        ],
        focus: [
          'Direktanfrage-Pfad mit klaren Unterkunfts-Highlights',
          'Vertrauensaufbau durch Lage, Ausstattung und Gastgeberprofil',
          'Schneller mobiler Kontaktweg für kurze Entscheidungsphasen',
        ],
      },
      {
        badge: 'Gastronomie',
        title: 'Restaurants',
        description:
          'Für Restaurants mit klarer Gäste-Kommunikation und direkten Reservierungsanfragen.',
        outcome:
          'Ziel: schnellere Reservierungen durch klare Inhalte, gute Lesbarkeit und direkte Kontaktwege.',
        href: '/branchen/restaurant-website',
        scenario: [
          'Öffnungszeiten, Speisekarte und Reservierung sind nicht schnell genug auffindbar.',
          'Auf mobilen Endgeräten entstehen unnötige Schritte bis zur Anfrage.',
        ],
        focus: [
          'Klare Navigation zu Karte, Standort und Reservierung',
          'Lesbare Struktur für spontane Suche unterwegs',
          'Sichtbare CTA-Logik in allen zentralen Abschnitten',
        ],
      },
      {
        badge: 'Weinbranche',
        title: 'Winzer, Weingüter und Sektgüter',
        description:
          'Für Weinbetriebe, die Weine, Termine und Direktkontakt klar präsentieren möchten.',
        outcome:
          'Ziel: bessere Sichtbarkeit von Sortiment, Terminen und Besuchsanfragen mit einem professionellen Auftritt.',
        href: '/branchen/weingut-sektgut-website',
        scenario: [
          'Sortiment und Profil sind offline stark, online aber nicht strukturiert genug dargestellt.',
          'Anliegen zu Besuch, Veranstaltungen und Verkauf werden nicht sauber getrennt.',
        ],
        focus: [
          'Eigene Nutzerpfade für Verkostung, Events und Kaufinteresse',
          'Klare Angebotsdarstellung plus Vertrauen über Betriebsgeschichte',
          'Kontaktweg mit Vorqualifizierung je nach Anfrageziel',
        ],
      },
    ],
    cta: 'Branchenseite öffnen',
    supportTitle: 'Noch unsicher, welche Branchen-Seite die richtige ist?',
    supportText:
      'Auf Wunsch kläre ich in einem kurzen Gespräch die sinnvollste Struktur für deinen Betrieb. Danach setze ich die Seite direkt sauber um.',
    supportPrimaryLabel: 'Alle Leistungen ansehen',
    supportSecondaryLabel: 'Erstberatung anfragen',
  };
}

export async function generateMetadata({
  params,
}: BranchenPageProps): Promise<Metadata> {
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
    title: getBranchenMetaTitle(locale),
    description: getBranchenMetaDescription(locale),
  });
}

export default async function BranchenPage({ params }: BranchenPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const navT = await getTranslations({ locale, namespace: 'navigation' });
  const legalT = await getTranslations({ locale, namespace: 'legal' });
  const commonT = await getTranslations({ locale, namespace: 'common' });
  const shouldHideDirectContactLinks = isTurnstileEnabled();
  const footerWhatsAppHref = shouldHideDirectContactLinks
    ? undefined
    : buildWhatsAppHref(
        siteConfig.contact.whatsAppDisplay,
        commonT('home.contact.whatsAppMessage')
      );
  const copy = getBranchenCopy(locale);

  const basePath = locale === 'de' ? '' : `/${locale}`;
  const homeHref = basePath || '/';
  const branchenHref = `${basePath}/branchen`;
  const primaryNavigationLabel = getPrimaryNavigationLabel(
    locale,
    siteConfig.name
  );

  const navItems: NavItem[] = [
    { label: navT('home'), href: homeHref },
    { label: navT('about'), href: `${basePath}/leistungen` },
    { label: locale === 'en' ? 'Industry' : 'Branche', href: branchenHref },
    { label: navT('contact'), href: `${homeHref}#kontakt` },
  ];

  const sectionLinks = [
    { href: '#ueberblick', label: copy.nav.grid },
    { href: '#playbook', label: copy.nav.playbook },
    { href: '#support', label: copy.nav.support },
  ];

  const getCardId = (href: string) =>
    href.split('/').filter(Boolean).pop() ?? href;
  const headerControls = await getHeaderControlsCopy(locale);

  return (
    <div className="surface-page flex min-h-screen flex-col">
      <PageSmoothScroll />
      <HomeHeader
        appName={siteConfig.name}
        navItems={navItems}
        brandHref={homeHref}
        activeHref={branchenHref}
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

                <div className="relative mt-9 max-w-5xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-900 dark:text-amber-200">
                    {copy.processTitle}
                  </p>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {copy.processSteps.map((step) => (
                      <li
                        key={step}
                        className="bg-stone-50/72 rounded-xl border border-stone-200/70 px-3 py-2.5 text-sm text-stone-800 shadow-[0_10px_25px_rgba(28,25,23,0.04)] dark:border-stone-700/70 dark:bg-stone-900/45 dark:text-stone-200"
                      >
                        {step}
                      </li>
                    ))}
                  </ul>
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
                  {copy.gridTitle}
                </h2>
                <p className="mt-3 text-sm leading-7 text-stone-700 dark:text-stone-200 sm:text-base">
                  {copy.gridText}
                </p>
              </div>
              <div className="card-grid-balance-md-xl mt-8 grid gap-4 [--card-grid-gap:1rem] md:grid-cols-2 xl:grid-cols-3">
                {copy.cards.map((card, index) => {
                  const id = getCardId(card.href);

                  return (
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
                      <a
                        href={`#${id}`}
                        className="mt-auto inline-flex items-center gap-1.5 self-end pt-4 text-sm font-semibold text-amber-800 transition hover:text-amber-700 dark:text-amber-200 dark:hover:text-amber-100"
                      >
                        {copy.playbookLabels.scenario}
                        <span aria-hidden="true">-&gt;</span>
                      </a>
                    </RevealOnScroll>
                  );
                })}
              </div>
            </RevealOnScroll>

            <RevealOnScroll
              as="section"
              id="playbook"
              delayMs={120}
              className="mt-20 scroll-mt-28 border-t border-stone-200/70 pt-14 dark:border-stone-700/70 sm:mt-24 sm:pt-16"
            >
              <h2 className="text-2xl font-black tracking-tight text-stone-950 dark:text-stone-50 sm:text-3xl">
                {copy.playbookTitle}
              </h2>
              <p className="mt-3 max-w-5xl text-sm leading-7 text-stone-700 dark:text-stone-200 sm:text-base">
                {copy.playbookText}
              </p>

              <div className="mt-8 space-y-12">
                {copy.cards.map((card, index) => {
                  const id = getCardId(card.href);

                  return (
                    <RevealOnScroll
                      as="article"
                      key={card.href}
                      id={id}
                      delayMs={160 + index * 70}
                      className="scroll-mt-28 border-t border-stone-200/75 pt-8 first:border-t-0 first:pt-0 dark:border-stone-700/70"
                    >
                      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-10">
                        <div className="min-w-0">
                          <p className="inline-flex rounded-full border border-amber-300/70 bg-amber-100/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900 dark:border-amber-300/40 dark:bg-amber-300/10 dark:text-amber-200">
                            {card.badge}
                          </p>
                          <h3 className="mt-4 text-2xl font-black tracking-tight text-stone-950 dark:text-stone-50 sm:text-3xl">
                            {card.title}
                          </h3>
                          <p className="mt-4 max-w-xl text-sm leading-7 text-stone-700 dark:text-stone-200 sm:text-base">
                            {card.description}
                          </p>

                          <div className="mt-6 rounded-[1.35rem] border border-amber-200/80 bg-amber-50/85 p-4 dark:border-amber-300/25 dark:bg-amber-950/20 sm:p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-900 dark:text-amber-200">
                              {copy.playbookLabels.result}
                            </p>
                            <p className="mt-3 text-sm leading-7 text-stone-700 dark:text-stone-200">
                              {card.outcome}
                            </p>
                          </div>

                          <a
                            href={card.href}
                            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 transition hover:text-amber-700 dark:text-amber-200 dark:hover:text-amber-100"
                          >
                            {copy.cta}
                            <span aria-hidden="true">-&gt;</span>
                          </a>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="border-l-2 border-stone-200/80 pl-4 dark:border-stone-700/70">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-900 dark:text-amber-200">
                              {copy.playbookLabels.scenario}
                            </p>
                            <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-700 dark:text-stone-200">
                              {card.scenario.map((item) => (
                                <li key={item} className="flex gap-3">
                                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-amber-300" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="border-l-2 border-stone-200/80 pl-4 dark:border-stone-700/70">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-900 dark:text-amber-200">
                              {copy.playbookLabels.focus}
                            </p>
                            <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-700 dark:text-stone-200">
                              {card.focus.map((item) => (
                                <li key={item} className="flex gap-3">
                                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-amber-300" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </RevealOnScroll>
                  );
                })}
              </div>
            </RevealOnScroll>

            <RevealOnScroll
              as="section"
              id="support"
              delayMs={180}
              className="mt-20 scroll-mt-28 border-t border-stone-200/70 pt-14 dark:border-stone-700/70 sm:mt-24 sm:pt-16"
            >
              <h2 className="text-3xl font-black tracking-tight text-stone-950 dark:text-stone-50 sm:text-4xl">
                {copy.supportTitle}
              </h2>
              <p className="mt-4 max-w-5xl text-base leading-8 text-stone-700 dark:text-stone-200 sm:text-lg">
                {copy.supportText}
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`${basePath}/leistungen`}
                  className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-2.5 text-sm font-semibold text-stone-50 transition hover:bg-stone-800 dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300"
                >
                  {copy.supportPrimaryLabel}
                </a>
                <a
                  href={`${homeHref}#kontakt`}
                  className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white/70 px-5 py-2.5 text-sm font-semibold text-stone-900 transition hover:border-amber-600 hover:text-amber-800 dark:border-stone-600 dark:bg-stone-800/60 dark:text-stone-100 dark:hover:border-amber-300 dark:hover:text-amber-200"
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
