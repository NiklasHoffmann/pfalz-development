import type { Metadata } from 'next';
import { HomeFooter } from '@/components/home/HomeFooter';
import { HomeHeader } from '@/components/home/HomeHeader';
import { PageSmoothScroll } from '@/components/ui/PageSmoothScroll';
import { SectionSpyNav } from '@/components/ui/SectionSpyNav';
import type { NavItem } from '@/components/home/types';
import { siteConfig } from '@/config/site';
import { getHeaderControlsCopy } from '@/lib/locale-ui';
import { createPageMetadata, PALATINATE_HREFLANG } from '@/lib/seo';
import { getTranslations, setRequestLocale } from 'next-intl/server';

interface LeistungenPageProps {
  params: Promise<{ locale: string }>;
}

const pathByLocale = {
  de: '/leistungen',
  en: '/en/leistungen',
  pfl: '/pfl/leistungen',
} as const;

type LeistungenPageCopy = {
  title: string;
  intro: string;
  highlight: string;
  navTitle: string;
  nav: {
    entry: string;
    problems: string;
    solutions: string;
    proof: string;
  };
  entryTitle: string;
  entryText: string;
  entries: Array<{
    title: string;
    description: string;
    href: string;
    label: string;
  }>;
  problemTitle: string;
  problemIntro: string;
  problems: Array<{
    title: string;
    description: string;
  }>;
  solutionTitle: string;
  solutionIntro: string;
  processTitle: string;
  processSteps: string[];
  proofTitle: string;
  proofIntro: string;
  proofOutcomeLabel: string;
  proofPoints: string[];
  cards: Array<{
    title: string;
    description: string;
    href: string;
    badge: string;
  }>;
  cta: string;
  finalTitle: string;
  finalText: string;
  finalPrimaryLabel: string;
  finalSecondaryLabel: string;
};

function getPrimaryNavigationLabel(locale: string, appName: string): string {
  if (locale === 'en') {
    return `${appName} primary navigation`;
  }

  return `${appName} Hauptnavigation`;
}

function getLeistungenMetaTitle(locale: string): string {
  if (locale === 'en') {
    return 'Web Design, Relaunch, and Website Support in the Palatinate | Pfalz Development';
  }

  if (locale === 'pfl') {
    return 'Webdesign, Relaunch un Website-Pflege in de Palz | Pfalz Development';
  }

  return 'Webdesign, Relaunch und Website-Betreuung in der Pfalz | Pfalz Development';
}

function getLeistungenMetaDescription(locale: string): string {
  if (locale === 'en') {
    return 'Overview of web design, website relaunch, and ongoing website support for businesses in the Palatinate with clear structure, SEO basics, and inquiry-focused implementation.';
  }

  if (locale === 'pfl') {
    return 'Iwwersicht zu Webdesign, Website-Relaunch un laufender Website-Pflege fer Betriewe in de Palz mit klarer Struktur, Google-Grundlage un Aafrooch-Fokus.';
  }

  return 'Überblick zu Webdesign, Website-Relaunch und laufender Website-Betreuung für Unternehmen in der Pfalz mit klarer Struktur, SEO-Basis und anfrageorientierter Umsetzung.';
}

function getLeistungenCopy(locale: string): LeistungenPageCopy {
  if (locale === 'en') {
    return {
      title: 'Services for High-Impact Business Websites',
      intro:
        'All website services at a glance: clear offer, strong mobile experience, and more qualified inquiries.',
      highlight:
        'Pick your entry path first, then see the right service modules and concrete proof of implementation quality.',
      navTitle: 'Services',
      nav: {
        entry: 'Entry',
        problems: 'Typical Challenges',
        solutions: 'Service Modules',
        proof: 'Proof and Process',
      },
      entryTitle: 'Choose the starting point that fits your current situation',
      entryText:
        'This keeps the page focused and lets you skip straight to the most relevant offer.',
      entries: [
        {
          title: 'Need better inquiries',
          description:
            'For businesses that have website traffic but too few qualified leads.',
          href: '#probleme',
          label: 'See challenge pattern',
        },
        {
          title: 'Need a modern website setup',
          description:
            'For businesses with an outdated site that should be rebuilt strategically.',
          href: '#loesungen',
          label: 'See service modules',
        },
      ],
      problemTitle:
        'Typical website challenges before relaunch or optimization',
      problemIntro:
        'Most projects start with one of these blockers. I resolve them systematically in the implementation.',
      problems: [
        {
          title: 'Visitors do not understand the offer fast enough',
          description:
            'Positioning and message hierarchy are unclear, so users leave before taking action.',
        },
        {
          title: 'Mobile usage creates friction',
          description:
            'Navigation, readability, and contact flow are not tuned for real smartphone behavior.',
        },
        {
          title: 'No clear trust path to contact',
          description:
            'Missing proof and weak CTA structure reduce inquiry quality and conversion consistency.',
        },
      ],
      solutionTitle: 'Service modules matched to your bottleneck',
      solutionIntro:
        'Every module is outcome-driven and can run as a core project or as part of a larger growth setup.',
      processTitle: 'How collaboration works',
      processSteps: [
        'Audience and offer positioning',
        'Page structure and messaging flow',
        'Implementation with performance and SEO basics',
        'Launch and measurable optimization',
      ],
      proofTitle: 'Proof and implementation standards',
      proofIntro:
        'Besides design and copy, you get a process that is transparent, measurable, and easy to iterate.',
      proofOutcomeLabel: 'Outcome',
      proofPoints: [
        'Clear scope and priorities before implementation starts',
        'Fast page templates with modern technical baseline',
        'Conversion-oriented section logic across all key pages',
        'Post-launch checks and iterative optimization plan',
      ],
      cards: [
        {
          title: 'Web Design Palatinate',
          description:
            'Your central business website with clear positioning, conversion-focused structure, and modern technical setup.',
          href: '/leistungen/webdesign-pfalz',
          badge: 'Core Service',
        },
        {
          title: 'Website Relaunch',
          description:
            'For outdated websites that need a strategic rebuild to improve trust, usability, and inquiry quality.',
          href: '/leistungen/website-relaunch',
          badge: 'Service',
        },
        {
          title: 'Website Maintenance and Growth',
          description:
            'Continuous updates, technical upkeep, and focused improvements after launch to keep your site effective.',
          href: '/leistungen/website-wartung',
          badge: 'Service',
        },
      ],
      cta: 'Open service page',
      finalTitle: 'Ready to define the right setup?',
      finalText:
        'In a short call, I identify the right module mix and move directly into implementation.',
      finalPrimaryLabel: 'Request consultation',
      finalSecondaryLabel: 'Explore industry pages',
    };
  }

  if (locale === 'pfl') {
    return {
      title: 'Leischdunge fer starke Unternehmens-Webseide',
      intro:
        'All Webseide-Leischdunge uff en Blick: klare Aussage, schnelle Seid un meh passendi Aafrooche.',
      highlight:
        'Such erscht de passende Einstieg un geh dann direkt in die Leischdung, die zu deim Stand passt.',
      navTitle: 'Leischdunge',
      nav: {
        entry: 'Einstieg',
        problems: 'Haeufige Probleme',
        solutions: 'Leischdungs-Module',
        proof: 'Ablauf un Qualitaet',
      },
      entryTitle: 'Waehle de Einstieg, der grad zu deim Betrieb passt',
      entryText:
        'So kummersch schnell zu de Bausteine, die wirklich gebraucht werre.',
      entries: [
        {
          title: 'Ich brauch meh passendi Aafrooche',
          description:
            'Fer Betriebe mit Besuchern uff de Seid, awer zu wenige passende Kontakte.',
          href: '#probleme',
          label: 'Problem-Muster aa gugge',
        },
        {
          title: 'Ich brauch en moderne Webseide-Basis',
          description:
            'Fer veraltete Auftritte, die strategisch neu aufgebaut werre solle.',
          href: '#loesungen',
          label: 'Module aa gugge',
        },
      ],
      problemTitle: 'Typische Ausgangslage vor Relaunch oder Optimierung',
      problemIntro:
        'Meist start ich mit genau dene Stolpersteine un loes sie Schritt fer Schritt.',
      problems: [
        {
          title: 'Angebot wird net schnell genug verstanden',
          description:
            'Botschaft un Struktur sinn net klar, deshalb springe Besucher frieh ab.',
        },
        {
          title: 'Mobil is der Weg zu umstaendlich',
          description:
            'Navigation, Lesbarkeit un Kontaktweg passe net zum echten Handy-Verhalte.',
        },
        {
          title: 'Zu wenisch Vertrauen bis zur Anfrage',
          description:
            'Fehlende Nachweise un schwache CTA-Struktur druecke die Anfrage-Qualitaet.',
        },
      ],
      solutionTitle: 'Leischdungs-Module passend zu deim Engpass',
      solutionIntro:
        'Jedes Modul is uf Ergebnis ausgelegt un kann einzeln oder im Gesamtprojekt laafe.',
      processTitle: 'So laaft die Zammeaarwet',
      processSteps: [
        'Zielgruppe un Angebot klar aufstelle',
        'Seidestruktur un Botschaft sauber fuehre',
        'Umsetzung mit schneller Technik un Google-Grundlage',
        'Go-live un messbar weiter verbessere',
      ],
      proofTitle: 'Qualitaets- un Umsetzungsstandard',
      proofIntro:
        'Du kriegsch net nur Design, sondern en klar steuerbare Ablauf mit messbarem Ergebnis.',
      proofOutcomeLabel: 'Ergebnis',
      proofPoints: [
        'Klare Prioritaete bevor die Umsetzung startet',
        'Schnelle Seide-Bausteine mit moderner Technik-Basis',
        'Conversion-orientierter Aufbau ueber alle Kernseiten',
        'Kontrolle nach em Start plus geplanter Ausbau',
      ],
      cards: [
        {
          title: 'Webdesign Palz',
          description:
            'Dei zentrale Unternehmens-Webseide mit klarer Positionierung, Anfrage-Fokus un moderner Technik.',
          href: '/leistungen/webdesign-pfalz',
          badge: 'Kern-Leischdung',
        },
        {
          title: 'Website-Relaunch',
          description:
            'Fer veraltete Seide, die strategisch neu aufgebaut werre soll, damit Vertrauen un Aafrooche steige.',
          href: '/leistungen/website-relaunch',
          badge: 'Leischdung',
        },
        {
          title: 'Website-Pflege un Ausbau',
          description:
            'Laufende Pflege, technische Updates un gezielte Verbesserunge nach em Start.',
          href: '/leistungen/website-wartung',
          badge: 'Leischdung',
        },
      ],
      cta: 'Leischdungsseid uffmache',
      finalTitle: 'Bereit fer die passende Aufstellung?',
      finalText:
        'In eme kurze Gespaerch klaer ich de richtige Modul-Mix un geh direkt in die Umsetzung.',
      finalPrimaryLabel: 'Berodung aafohre',
      finalSecondaryLabel: 'Branche-Seide aa gugge',
    };
  }

  return {
    title: 'Leistungen für moderne Unternehmens-Websites',
    intro:
      'Alle Website-Leistungen auf einen Blick: klare Botschaft, schnelle Ladezeiten und mehr passende Anfragen.',
    highlight:
      'Wähle zuerst deinen Einstieg und springe danach direkt in die passenden Leistungsbausteine.',
    navTitle: 'Leistungen',
    nav: {
      entry: 'Einstieg',
      problems: 'Typische Probleme',
      solutions: 'Leistungsmodule',
      proof: 'Beweis und Ablauf',
    },
    entryTitle: 'Wähle den Einstieg, der zu deiner aktuellen Lage passt',
    entryText:
      'So bekommst du nicht einfach eine Liste, sondern eine klare Richtung mit direktem Nutzen.',
    entries: [
      {
        title: 'Ich brauche mehr passende Anfragen',
        description:
          'Für Unternehmen mit Besuchern auf der Seite, aber zu wenig qualifizierten Kontakten.',
        href: '#probleme',
        label: 'Problemfelder ansehen',
      },
      {
        title: 'Ich brauche einen modernen Website-Aufbau',
        description:
          'Für veraltete Websites, die strategisch neu aufgesetzt werden sollen.',
        href: '#loesungen',
        label: 'Leistungsmodule ansehen',
      },
    ],
    problemTitle: 'Typische Herausforderungen vor Relaunch oder Optimierung',
    problemIntro:
      'In den meisten Projekten sehe ich ähnliche Engpässe. Die Struktur unten zeigt, wie ich sie auflöse.',
    problems: [
      {
        title: 'Das Angebot wird nicht schnell genug verstanden',
        description:
          'Botschaft, Priorisierung und Seitenführung sind unklar. Dadurch springen Besucher zu früh ab.',
      },
      {
        title: 'Mobile Nutzung kostet zu viele Schritte',
        description:
          'Navigation, Lesbarkeit und Kontaktwege sind nicht auf reale Smartphone-Nutzung abgestimmt.',
      },
      {
        title: 'Vertrauen und Kontaktimpuls sind zu schwach',
        description:
          'Fehlende Belege und uneindeutige CTA-Pfade senken die Qualität und Menge der Anfragen.',
      },
    ],
    solutionTitle: 'Leistungsmodule passend zum jeweiligen Engpass',
    solutionIntro:
      'Jedes Modul ist ergebnisorientiert aufgebaut und lässt sich als Einzelprojekt oder Gesamtsystem einsetzen.',
    processTitle: 'So läuft die Zusammenarbeit',
    processSteps: [
      'Zielgruppe und Angebot klar ausrichten',
      'Seitenaufbau und Botschaften verständlich machen',
      'Technische Umsetzung: schnell, stabil und Google-freundlich',
      'Go-live und messbare Weiterentwicklung',
    ],
    proofTitle: 'Beweisbare Qualität in Umsetzung und Ablauf',
    proofIntro:
      'Neben Design und Text bekommst du einen klaren Prozess mit messbarer Priorisierung und sauberer Weiterentwicklung.',
    proofOutcomeLabel: 'Ergebnis',
    proofPoints: [
      'Klare Projektprioritäten vor Start der Umsetzung',
      'Schnelle technische Basis für Ladezeit und Stabilität',
      'Conversion-orientierte Seitenlogik auf allen Kernseiten',
      'Launch-Kontrolle und geplanter Optimierungszyklus',
    ],
    cards: [
      {
        title: 'Webdesign Pfalz',
        description:
          'Die zentrale Unternehmenswebsite mit klarer Botschaft, gutem Seitenaufbau und moderner technischer Basis.',
        href: '/leistungen/webdesign-pfalz',
        badge: 'Kernleistung',
      },
      {
        title: 'Website Relaunch',
        description:
          'Für veraltete Websites, die neu aufgebaut werden sollen, damit Besucher schneller verstehen, was du anbietest und wie sie dich erreichen.',
        href: '/leistungen/website-relaunch',
        badge: 'Leistung',
      },
      {
        title: 'Website Wartung und Ausbau',
        description:
          'Laufende Pflege, technische Betreuung und gezielte Optimierung nach dem Launch, damit deine Seite dauerhaft wirkt.',
        href: '/leistungen/website-wartung',
        badge: 'Leistung',
      },
    ],
    cta: 'Leistungsseite öffnen',
    finalTitle: 'Nächster Schritt: die passende Kombination festlegen',
    finalText:
      'In einem kurzen Gespräch kläre ich die sinnvollste Modul-Reihenfolge und starte danach direkt in die Umsetzung.',
    finalPrimaryLabel: 'Erstberatung anfragen',
    finalSecondaryLabel: 'Branchen-Seiten ansehen',
  };
}

export async function generateMetadata({
  params,
}: LeistungenPageProps): Promise<Metadata> {
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
    title: getLeistungenMetaTitle(locale),
    description: getLeistungenMetaDescription(locale),
  });
}

export default async function LeistungenPage({ params }: LeistungenPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const navT = await getTranslations({ locale, namespace: 'navigation' });
  const legalT = await getTranslations({ locale, namespace: 'legal' });
  const copy = getLeistungenCopy(locale);

  const basePath = locale === 'de' ? '' : `/${locale}`;
  const homeHref = basePath || '/';
  const leistungenHref = `${basePath}/leistungen`;
  const primaryNavigationLabel = getPrimaryNavigationLabel(
    locale,
    siteConfig.name
  );

  const navItems: NavItem[] = [
    { label: navT('home'), href: homeHref },
    { label: navT('about'), href: leistungenHref },
    {
      label: locale === 'en' ? 'Industry' : 'Branche',
      href: `${basePath}/branchen`,
    },
    { label: navT('contact'), href: `${homeHref}#kontakt` },
  ];

  const sectionLinks = [
    { href: '#einstieg', label: copy.nav.entry },
    { href: '#probleme', label: copy.nav.problems },
    { href: '#loesungen', label: copy.nav.solutions },
    { href: '#beweis', label: copy.nav.proof },
  ];

  return (
    <div className="surface-page flex min-h-screen flex-col">
      <PageSmoothScroll />
      <HomeHeader
        appName={siteConfig.name}
        navItems={navItems}
        brandHref={homeHref}
        activeHref={leistungenHref}
        navAriaLabel={primaryNavigationLabel}
        controls={getHeaderControlsCopy(locale)}
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
            <section className="pt-2 sm:pt-4">
              <div className="pl-1 sm:pl-2 lg:pl-4">
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
            </section>

            <section id="einstieg" className="mt-14 scroll-mt-28 sm:mt-16">
              <div className="surface-section-muted rounded-3xl border border-stone-200/80 p-6 dark:border-stone-700 dark:bg-stone-900/35 sm:p-8">
                <h2 className="text-2xl font-black tracking-tight text-stone-950 dark:text-stone-50 sm:text-3xl">
                  {copy.entryTitle}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-700 dark:text-stone-200 sm:text-base">
                  {copy.entryText}
                </p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {copy.entries.map((entry) => (
                    <article
                      key={entry.title}
                      className="flex h-full flex-col rounded-2xl border border-stone-200/90 bg-stone-100/80 p-5 dark:border-stone-700 dark:bg-stone-800/65"
                    >
                      <h3 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                        {entry.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-stone-700 dark:text-stone-200">
                        {entry.description}
                      </p>
                      <a
                        href={entry.href}
                        className="mt-auto inline-flex items-center gap-1.5 self-end pt-4 text-sm font-semibold text-amber-800 transition hover:text-amber-700 dark:text-amber-200 dark:hover:text-amber-100"
                      >
                        {entry.label}
                        <span aria-hidden="true">-&gt;</span>
                      </a>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section
              id="probleme"
              className="mt-14 scroll-mt-28 border-t border-stone-200/70 pt-10 dark:border-stone-700/70 sm:mt-16 sm:pt-12"
            >
              <h2 className="text-2xl font-black tracking-tight text-stone-950 dark:text-stone-50 sm:text-3xl">
                {copy.problemTitle}
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-stone-700 dark:text-stone-200 sm:text-base">
                {copy.problemIntro}
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {copy.problems.map((problem) => (
                  <article
                    key={problem.title}
                    className="rounded-2xl border border-stone-200/80 bg-stone-50/80 p-5 dark:border-stone-700 dark:bg-stone-900/35"
                  >
                    <h3 className="text-base font-bold text-stone-950 dark:text-stone-50">
                      {problem.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-stone-700 dark:text-stone-200">
                      {problem.description}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section
              id="loesungen"
              className="mt-14 scroll-mt-28 border-t border-stone-200/70 pt-10 dark:border-stone-700/70 sm:mt-16 sm:pt-12"
            >
              <h2 className="text-2xl font-black tracking-tight text-stone-950 dark:text-stone-50 sm:text-3xl">
                {copy.solutionTitle}
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-stone-700 dark:text-stone-200 sm:text-base">
                {copy.solutionIntro}
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {copy.cards.map((card) => (
                  <article
                    key={card.href}
                    className="flex h-full flex-col rounded-2xl border border-stone-200/90 bg-stone-100/80 p-5 dark:border-stone-700 dark:bg-stone-800/65"
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
                      href={card.href}
                      className="mt-auto inline-flex items-center gap-1.5 self-end pt-4 text-sm font-semibold text-amber-800 hover:text-amber-700 dark:text-amber-200 dark:hover:text-amber-100"
                    >
                      {copy.cta}
                      <span aria-hidden="true">-&gt;</span>
                    </a>
                  </article>
                ))}
              </div>
            </section>

            <section
              id="beweis"
              className="mt-14 scroll-mt-28 border-t border-stone-200/70 pt-10 dark:border-stone-700/70 sm:mt-16 sm:pt-12"
            >
              <div className="surface-section-muted rounded-3xl border border-stone-200/80 p-6 dark:border-stone-700 dark:bg-stone-900/35 sm:p-8">
                <h2 className="text-2xl font-black tracking-tight text-stone-950 dark:text-stone-50 sm:text-3xl">
                  {copy.proofTitle}
                </h2>
                <p className="mt-3 max-w-4xl text-sm leading-7 text-stone-700 dark:text-stone-200 sm:text-base">
                  {copy.proofIntro}
                </p>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-900 dark:text-amber-200">
                      {copy.processTitle}
                    </p>
                    <ul className="mt-4 grid gap-3">
                      {copy.processSteps.map((step) => (
                        <li
                          key={step}
                          className="rounded-xl bg-stone-100/80 px-3 py-2.5 text-sm text-stone-800 dark:bg-stone-800/70 dark:text-stone-100"
                        >
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-900 dark:text-amber-200">
                      {copy.proofOutcomeLabel}
                    </p>
                    <ul className="mt-4 grid gap-3">
                      {copy.proofPoints.map((point) => (
                        <li
                          key={point}
                          className="rounded-xl bg-stone-100/80 px-3 py-2.5 text-sm text-stone-800 dark:bg-stone-800/70 dark:text-stone-100"
                        >
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-14 border-t border-stone-200/70 pb-4 pt-10 dark:border-stone-700/70 sm:mt-16 sm:pt-12">
              <h2 className="text-3xl font-black tracking-tight text-stone-950 dark:text-stone-50 sm:text-4xl">
                {copy.finalTitle}
              </h2>
              <p className="mt-4 max-w-4xl text-base leading-8 text-stone-700 dark:text-stone-200 sm:text-lg">
                {copy.finalText}
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`${homeHref}#kontakt`}
                  className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-2.5 text-sm font-semibold text-stone-50 transition hover:bg-stone-800 dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300"
                >
                  {copy.finalPrimaryLabel}
                </a>
                <a
                  href={`${basePath}/branchen`}
                  className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white/70 px-5 py-2.5 text-sm font-semibold text-stone-900 transition hover:border-amber-600 hover:text-amber-800 dark:border-stone-600 dark:bg-stone-800/60 dark:text-stone-100 dark:hover:border-amber-300 dark:hover:text-amber-200"
                >
                  {copy.finalSecondaryLabel}
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>

      <HomeFooter
        note={legalT('footerNote')}
        imprintLabel={legalT('imprint.title')}
        privacyLabel={legalT('privacy.title')}
        imprintHref={`${basePath}/impressum`}
        privacyHref={`${basePath}/datenschutz`}
      />
    </div>
  );
}
