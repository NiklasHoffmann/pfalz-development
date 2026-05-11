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
    regions: string;
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
  problemNextText: string;
  problemNextLabel: string;
  problems: Array<{
    title: string;
    description: string;
  }>;
  solutionTitle: string;
  solutionIntro: string;
  processTitle: string;
  processSteps: string[];
  regionsTitle: string;
  regionsIntro: string;
  regionsOverviewLabel: string;
  regionsOverviewHref: string;
  regionsCards: Array<{
    title: string;
    description: string;
    href: string;
  }>;
  regionsCta: string;
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
    return 'Web Design, Web Development, Relaunch, and Website Support | Pfalz Development';
  }

  if (locale === 'pfl') {
    return 'Webdesign, Webentwicklung, Relaunch un Website-Pflege | Pfalz Development';
  }

  return 'Webdesign, Webentwicklung, Relaunch und Website-Betreuung | Pfalz Development';
}

function getLeistungenMetaDescription(locale: string): string {
  if (locale === 'en') {
    return 'Overview of web design, web development, website relaunch, and ongoing website support for businesses in the Palatinate with clear structure and inquiry-focused implementation.';
  }

  if (locale === 'pfl') {
    return 'Iwwersicht zu Webdesign, Webentwicklung, Website-Relaunch un laufender Website-Pflege fer Betriewe in de Palz mit klarer Struktur un Aafrooch-Fokus.';
  }

  return 'Überblick zu Webdesign, Webentwicklung, Website-Relaunch und laufender Website-Betreuung für Unternehmen in der Pfalz mit klarer Struktur und anfrageorientierter Umsetzung.';
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
        regions: 'Locations',
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
      problemNextText:
        'If you recognize your situation here, the next step is the matching service module below. That section shows which setup fits your bottleneck best.',
      problemNextLabel: 'Go to service modules',
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
      regionsTitle: 'Regional entry points for Neustadt, Landau, and Speyer',
      regionsIntro:
        'If local context matters for your business, you can also enter through the dedicated regional pages. They all lead into the same core service, but with different positioning: Neustadt is more regional and hospitality-adjacent, Landau more modern and mobile-first, and Speyer more trust- and credibility-driven.',
      regionsOverviewLabel: 'View all local pages',
      regionsOverviewHref: '/orte',
      regionsCards: [
        {
          title: 'Web Design Neustadt an der Weinstraße',
          description:
            'For businesses around Neustadt and the Weinstraße that need stronger regional trust and clearer positioning.',
          href: '/orte/webdesign-neustadt',
        },
        {
          title: 'Web Design Landau in der Pfalz',
          description:
            'For businesses in Landau that need a more modern outward presence and clearer mobile-first communication.',
          href: '/orte/webdesign-landau',
        },
        {
          title: 'Web Design Speyer',
          description:
            'For businesses in Speyer that need a more professional, trustworthy presence and a clearer path to qualified inquiries.',
          href: '/orte/webdesign-speyer',
        },
      ],
      regionsCta: 'Open local page',
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
          title: 'Web Development Palatinate',
          description:
            'Technical implementation with fast performance, stable structure, and a setup that can grow with new content and pages.',
          href: '/leistungen/webentwicklung-pfalz',
          badge: 'Service',
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
        problems: 'Häufige Probleme',
        solutions: 'Leischdungs-Module',
        regions: 'Regione',
        proof: 'Ablauf un Qualität',
      },
      entryTitle: 'Wähle de Einstieg, der grad zu deim Betrieb passt',
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
        'Meist start ich mit genau dene Stolpersteine un lös sie Schritt fer Schritt.',
      problemNextText:
        'Wenn de dich do widderfinnsch, geh als neggschdes direkt zu de passende Leischdungs-Module. Dort siehsch, welcher Ansatz am beschde zu deim Engpass passt.',
      problemNextLabel: 'Zu de Leischdungs-Module',
      problems: [
        {
          title: 'Angebot wird net schnell genug verstanden',
          description:
            'Botschaft un Struktur sinn net klar, deshalb springe Besucher frieh ab.',
        },
        {
          title: 'Mobil is der Weg zu umständlich',
          description:
            'Navigation, Lesbarkeit un Kontaktweg passe net zum echten Handy-Verhalte.',
        },
        {
          title: 'Zu wenisch Vertrauen bis zur Anfrage',
          description:
            'Fehlende Nachweise un schwache CTA-Struktur drücke die Anfrage-Qualität.',
        },
      ],
      solutionTitle: 'Leischdungs-Module passend zu deim Engpass',
      solutionIntro:
        'Jedes Modul is uf Ergebnis ausgelegt un kann einzeln oder im Gesamtprojekt laafe.',
      processTitle: 'So laaft die Zammeaarwet',
      processSteps: [
        'Zielgruppe un Angebot klar aufstelle',
        'Seidestruktur un Botschaft sauber führe',
        'Umsetzung mit schneller Technik un Google-Grundlage',
        'Go-live un messbar weiter verbessere',
      ],
      regionsTitle: 'Regionale Einstiege fer Neustadt, Landau un Speyer',
      regionsIntro:
        'Wenn der lokale Bezug fer dein Betrieb wichtig is, kannsch aa iwwer die regionale Einstiegsseite reingehe. Sie führe all ins gleiche Kernangebot, setze awer unterschiedliche Schwerpunkte: Neustadt eher regional un gastgebernah, Landau moderner un mobiler un Speyer stärker uff Vertrauen un Seriosität ausgericht.',
      regionsOverviewLabel: 'Alle regionale Seide aa gugge',
      regionsOverviewHref: '/orte',
      regionsCards: [
        {
          title: 'Webdesign Neustadt an de Weischdroß',
          description:
            'Fer Betriewe rund um Neustadt un die Weischdroß, die meh regionales Vertraue un en klarere Positionierung brauche.',
          href: '/orte/webdesign-neustadt',
        },
        {
          title: 'Webdesign Landau in de Palz',
          description:
            'Fer Betriewe in Landau, die moderner wirke un mobil schneller verstanden werre müsse.',
          href: '/orte/webdesign-landau',
        },
        {
          title: 'Webdesign Speyer',
          description:
            'Fer Betriewe in Speyer, die professioneller, vertrauenswürdiger un klarer online wirke wolle.',
          href: '/orte/webdesign-speyer',
        },
      ],
      regionsCta: 'Regionale Seid uffmache',
      proofTitle: 'Qualitäts- un Umsetzungsstandard',
      proofIntro:
        'Du kriegsch net nur Design, sondern en klar steuerbare Ablauf mit messbarem Ergebnis.',
      proofOutcomeLabel: 'Ergebnis',
      proofPoints: [
        'Klare Prioritäten bevor die Umsetzung startet',
        'Schnelle Seide-Bausteine mit moderner Technik-Basis',
        'Conversion-orientierter Aufbau über alle Kernseiten',
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
          title: 'Webentwicklung Palz',
          description:
            'Technische Umsetzung mit schneller Leistung, stabiler Struktur un sauberer Grundlage fer spätere Erweiterunge.',
          href: '/leistungen/webentwicklung-pfalz',
          badge: 'Leischdung',
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
        'In eme kurze Gespräch klär ich de richtige Modul-Mix un geh direkt in die Umsetzung.',
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
      regions: 'Regionen',
      proof: 'Qualität und Ablauf',
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
    problemNextText:
      'Wenn du dich hier wiederfindest, geh als Nächstes direkt zu den passenden Leistungsmodulen. Dort siehst du, welcher Ansatz am besten zu deinem Engpass passt.',
    problemNextLabel: 'Zu den Leistungsmodulen',
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
    regionsTitle: 'Regionale Einstiege für Neustadt, Landau und Speyer',
    regionsIntro:
      'Wenn für deinen Betrieb der Ortsbezug wichtig ist, kannst du zusätzlich über die regionalen Einstiegsseiten einsteigen. Sie führen alle ins gleiche Kernangebot, setzen aber unterschiedliche Schwerpunkte: Neustadt stärker regional und gastgebernah, Landau moderner und mobiler, Speyer stärker auf Vertrauen und Seriosität ausgerichtet.',
    regionsOverviewLabel: 'Alle Ortsseiten ansehen',
    regionsOverviewHref: '/orte',
    regionsCards: [
      {
        title: 'Website erstellen lassen in Neustadt an der Weinstraße',
        description:
          'Für Unternehmen rund um Neustadt und die Weinstraße, die eine Website mit stärkerem Regionalbezug und mehr Vertrauen erstellen lassen möchten.',
        href: '/orte/webdesign-neustadt',
      },
      {
        title: 'Website erstellen lassen in Landau in der Pfalz',
        description:
          'Für Unternehmen in Landau, die eine Website mit modernerem Auftritt und stärkerer mobiler Wirkung erstellen lassen möchten.',
        href: '/orte/webdesign-landau',
      },
      {
        title: 'Website erstellen lassen in Speyer',
        description:
          'Für Unternehmen in Speyer, die eine Website mit professionellerem Auftritt und mehr Vertrauen erstellen lassen möchten.',
        href: '/orte/webdesign-speyer',
      },
    ],
    regionsCta: 'Ortsseite öffnen',
    proofTitle: 'Nachvollziehbare Qualität in Umsetzung und Ablauf',
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
        title: 'Webentwicklung Pfalz',
        description:
          'Technische Umsetzung mit schneller Ladezeit, sauberer Struktur und einer Website-Basis, die sich später gezielt ausbauen lässt.',
        href: '/leistungen/webentwicklung-pfalz',
        badge: 'Leistung',
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
          'Laufende Pflege, technische Betreuung und gezielte Optimierung nach dem Launch, damit deine Website dauerhaft wirksam bleibt.',
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
  const commonT = await getTranslations({ locale, namespace: 'common' });
  const shouldHideDirectContactLinks = isTurnstileEnabled();
  const footerWhatsAppHref = shouldHideDirectContactLinks
    ? undefined
    : buildWhatsAppHref(
        siteConfig.contact.whatsAppDisplay,
        commonT('home.contact.whatsAppMessage')
      );
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
    { href: '#regionen', label: copy.nav.regions },
  ];
  const headerControls = await getHeaderControlsCopy(locale);

  return (
    <div className="surface-page flex min-h-screen flex-col">
      <PageSmoothScroll />
      <HomeHeader
        appName={siteConfig.name}
        navItems={navItems}
        brandHref={homeHref}
        activeHref={leistungenHref}
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
              id="einstieg"
              delayMs={80}
              className="mt-20 scroll-mt-28 sm:mt-24"
            >
              <div className="max-w-3xl">
                <h2 className="text-2xl font-black tracking-tight text-stone-950 dark:text-stone-50 sm:text-3xl">
                  {copy.entryTitle}
                </h2>
                <p className="mt-3 text-sm leading-7 text-stone-700 dark:text-stone-200 sm:text-base">
                  {copy.entryText}
                </p>
              </div>
              <div className="mt-8 max-w-5xl border-t border-stone-200/75 dark:border-stone-700/70">
                <div className="divide-y divide-stone-200/75 dark:divide-stone-700/70">
                  {copy.entries.map((entry, index) => (
                    <RevealOnScroll
                      as="article"
                      key={entry.title}
                      delayMs={120 + index * 50}
                      className="grid gap-4 py-5 first:pt-6 last:pb-0 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-6"
                    >
                      <div className="bg-amber-500/12 inline-flex h-11 w-11 items-center justify-center rounded-full border border-amber-500/40 text-sm font-bold text-amber-800 dark:border-amber-300/35 dark:bg-amber-300/10 dark:text-amber-100">
                        0{index + 1}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                          {entry.title}
                        </h3>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-700 dark:text-stone-200">
                          {entry.description}
                        </p>
                      </div>
                      <a
                        href={entry.href}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 transition hover:text-amber-700 dark:text-amber-200 dark:hover:text-amber-100"
                      >
                        {entry.label}
                        <span aria-hidden="true">-&gt;</span>
                      </a>
                    </RevealOnScroll>
                  ))}
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll
              as="section"
              id="probleme"
              delayMs={110}
              className="mt-20 scroll-mt-28 border-t border-stone-200/70 pt-14 dark:border-stone-700/70 sm:mt-24 sm:pt-16"
            >
              <h2 className="text-2xl font-black tracking-tight text-stone-950 dark:text-stone-50 sm:text-3xl">
                {copy.problemTitle}
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-stone-700 dark:text-stone-200 sm:text-base">
                {copy.problemIntro}
              </p>
              <ol className="mt-8 grid gap-8" aria-label={copy.problemTitle}>
                {copy.problems.map((problem, index) => (
                  <RevealOnScroll
                    as="li"
                    key={problem.title}
                    delayMs={150 + index * 50}
                    className="grid gap-4 border-t border-stone-200/75 pt-6 first:border-t-0 first:pt-0 dark:border-stone-700/70 md:grid-cols-[auto_minmax(0,1fr)] md:gap-6"
                  >
                    <div className="bg-amber-500/12 inline-flex h-11 w-11 items-center justify-center rounded-full border border-amber-500/40 text-sm font-bold text-amber-800 dark:border-amber-300/35 dark:bg-amber-300/10 dark:text-amber-100">
                      0{index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                        {problem.title}
                      </h3>
                      <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-700 dark:text-stone-200 sm:text-base">
                        {problem.description}
                      </p>
                    </div>
                  </RevealOnScroll>
                ))}
              </ol>
              <div className="mt-8 max-w-4xl rounded-[1.35rem] border border-amber-200/80 bg-amber-50/80 p-5 dark:border-amber-300/25 dark:bg-amber-950/20 sm:p-6">
                <p className="text-sm leading-7 text-stone-800 dark:text-stone-100 sm:text-base">
                  {copy.problemNextText}
                </p>
                <a
                  href="#loesungen"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 transition hover:text-amber-700 dark:text-amber-200 dark:hover:text-amber-100"
                >
                  {copy.problemNextLabel}
                  <span aria-hidden="true">-&gt;</span>
                </a>
              </div>
            </RevealOnScroll>

            <RevealOnScroll
              as="section"
              id="loesungen"
              delayMs={140}
              className="mt-20 scroll-mt-28 border-t border-stone-200/70 pt-14 dark:border-stone-700/70 sm:mt-24 sm:pt-16"
            >
              <h2 className="text-2xl font-black tracking-tight text-stone-950 dark:text-stone-50 sm:text-3xl">
                {copy.solutionTitle}
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-stone-700 dark:text-stone-200 sm:text-base">
                {copy.solutionIntro}
              </p>
              <div className="card-grid-balance-md-xl mt-5 grid gap-4 [--card-grid-gap:1rem] md:grid-cols-2 xl:grid-cols-3">
                {copy.cards.map((card, index) => (
                  <RevealOnScroll
                    as="article"
                    key={card.href}
                    delayMs={180 + index * 60}
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
                      href={card.href}
                      className="mt-auto inline-flex items-center gap-1.5 self-end pt-4 text-sm font-semibold text-amber-800 hover:text-amber-700 dark:text-amber-200 dark:hover:text-amber-100"
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
              id="beweis"
              delayMs={170}
              className="mt-20 scroll-mt-28 border-t border-stone-200/70 pt-14 dark:border-stone-700/70 sm:mt-24 sm:pt-16"
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
                          className="bg-stone-50/88 rounded-xl px-3 py-2.5 text-sm text-stone-800 dark:bg-stone-800/70 dark:text-stone-100"
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
                          className="bg-stone-50/88 rounded-xl px-3 py-2.5 text-sm text-stone-800 dark:bg-stone-800/70 dark:text-stone-100"
                        >
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll
              as="section"
              id="regionen"
              delayMs={185}
              className="mt-20 scroll-mt-28 border-t border-stone-200/70 pt-14 dark:border-stone-700/70 sm:mt-24 sm:pt-16"
            >
              <div className="bg-white/82 rounded-[1.75rem] border border-stone-200/80 p-6 dark:border-stone-700/75 dark:bg-stone-900/45 sm:p-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-4xl">
                    <h2 className="text-2xl font-black tracking-tight text-stone-950 dark:text-stone-50 sm:text-3xl">
                      {copy.regionsTitle}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-stone-700 dark:text-stone-200 sm:text-base">
                      {copy.regionsIntro}
                    </p>
                  </div>
                  <a
                    href={`${basePath}${copy.regionsOverviewHref}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 transition hover:text-amber-700 dark:text-amber-200 dark:hover:text-amber-100"
                  >
                    {copy.regionsOverviewLabel}
                    <span aria-hidden="true">-&gt;</span>
                  </a>
                </div>

                <div className="card-grid-balance-md-xl mt-6 grid gap-4 [--card-grid-gap:1rem] md:grid-cols-2 xl:grid-cols-3">
                  {copy.regionsCards.map((region, index) => (
                    <RevealOnScroll
                      as="article"
                      key={region.href}
                      delayMs={205 + index * 50}
                      className="flex h-full flex-col rounded-[1.25rem] border border-stone-200/90 bg-stone-50/95 p-5 shadow-[0_12px_26px_rgba(28,25,23,0.05)] dark:border-stone-700 dark:bg-stone-800/65"
                    >
                      <h3 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                        {region.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-stone-700 dark:text-stone-200">
                        {region.description}
                      </p>
                      <a
                        href={`${basePath}${region.href}`}
                        className="mt-auto inline-flex items-center gap-1.5 self-end pt-4 text-sm font-semibold text-amber-800 transition hover:text-amber-700 dark:text-amber-200 dark:hover:text-amber-100"
                      >
                        {copy.regionsCta}
                        <span aria-hidden="true">-&gt;</span>
                      </a>
                    </RevealOnScroll>
                  ))}
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll
              as="section"
              delayMs={200}
              className="mt-20 border-t border-stone-200/70 pb-4 pt-14 dark:border-stone-700/70 sm:mt-24 sm:pt-16"
            >
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
