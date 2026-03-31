import { Link } from '@/routing';
import { HomeFooter } from '@/components/home/HomeFooter';
import { HomeHeader } from '@/components/home/HomeHeader';
import type { NavItem } from '@/components/home/types';
import { siteConfig } from '@/config/site';
import { getTranslations, setRequestLocale } from 'next-intl/server';

interface BranchenPageProps {
  params: Promise<{ locale: string }>;
}

type BranchenPageCopy = {
  title: string;
  intro: string;
  cards: Array<{
    title: string;
    description: string;
    href: string;
  }>;
  cta: string;
};

function getBranchenCopy(locale: string): BranchenPageCopy {
  if (locale === 'en') {
    return {
      title: 'Industry Pages in the Palatinate',
      intro:
        'Here you can find all current industry pages. Choose the one that matches your business focus.',
      cards: [
        {
          title: 'Holiday Rentals',
          description:
            'For hosts who want more direct booking inquiries and less platform dependency.',
          href: '/branchen/ferienwohnung-website',
        },
        {
          title: 'Restaurants',
          description:
            'For restaurant businesses that need clear guest information and direct reservation inquiries.',
          href: '/branchen/restaurant-website',
        },
        {
          title: 'Winegrowers, Wineries, and Sparkling Wine Estates',
          description:
            'For wine businesses that want to present wines, events, and direct contact in a clear flow.',
          href: '/branchen/weingut-sektgut-website',
        },
      ],
      cta: 'Open industry page',
    };
  }

  if (locale === 'pfl') {
    return {
      title: 'Branche-Seide in de Palz',
      intro:
        'Do findsch all aktuelle Branche-Seide. Such dir die Seid aus, die am beschde zu deim Betrieb passt.',
      cards: [
        {
          title: 'Feriewohnunge',
          description:
            'Fer Gaschdgewwer, die meh direkte Buchungsafrooche un wenischer Plattform-Abhaengigkeit wolle.',
          href: '/branchen/ferienwohnung-website',
        },
        {
          title: 'Restaurants',
          description:
            'Fer Restaurants mit klare Gaste-Infos un direkte Reservierungsaafrooche.',
          href: '/branchen/restaurant-website',
        },
        {
          title: 'Winzer, Woigieder un Sekdgieder',
          description:
            'Fer Weinbetriewe, die Weine, Termine un Kontakt klar un uebersichtlich zeige wolle.',
          href: '/branchen/weingut-sektgut-website',
        },
      ],
      cta: 'Brancheseid uffmache',
    };
  }

  return {
    title: 'Branchen-Seiten in der Pfalz',
    intro:
      'Hier findest du alle aktuellen Branchen-Seiten. Wähle die Seite, die am besten zu deinem Betrieb passt.',
    cards: [
      {
        title: 'Ferienwohnungen',
        description:
          'Für Gastgeber, die mehr Direktbuchungsanfragen und weniger Plattformabhängigkeit wollen.',
        href: '/branchen/ferienwohnung-website',
      },
      {
        title: 'Restaurants',
        description:
          'Für Restaurants mit klarer Gäste-Kommunikation und direkten Reservierungsanfragen.',
        href: '/branchen/restaurant-website',
      },
      {
        title: 'Winzer, Weingüter und Sektgüter',
        description:
          'Für Weinbetriebe, die Weine, Termine und Direktkontakt klar präsentieren möchten.',
        href: '/branchen/weingut-sektgut-website',
      },
    ],
    cta: 'Branchenseite öffnen',
  };
}

export default async function BranchenPage({ params }: BranchenPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const navT = await getTranslations({ locale, namespace: 'navigation' });
  const legalT = await getTranslations({ locale, namespace: 'legal' });
  const copy = getBranchenCopy(locale);

  const basePath = locale === 'de' ? '' : `/${locale}`;
  const homeHref = basePath || '/';
  const branchenHref = `${basePath}/branchen`;

  const navItems: NavItem[] = [
    { label: navT('home'), href: homeHref },
    { label: navT('about'), href: `${basePath}/leistungen/webdesign-pfalz` },
    { label: locale === 'en' ? 'Industry' : 'Branche', href: branchenHref },
    { label: navT('contact'), href: `${homeHref}#kontakt` },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <HomeHeader
        appName={siteConfig.name}
        navItems={navItems}
        brandHref={homeHref}
        activeHref={branchenHref}
      />
      <main className="mx-auto flex w-full max-w-7xl flex-1 items-center px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-10">
        <div className="w-full">
          <section className="rounded-3xl border border-stone-200/90 bg-white/90 p-6 shadow-sm dark:border-stone-700/80 dark:bg-stone-900/80 sm:p-8">
            <h1 className="text-3xl font-black tracking-tight text-stone-950 dark:text-stone-50 sm:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-stone-700 dark:text-stone-200">
              {copy.intro}
            </p>
          </section>

          <section className="mt-8 grid gap-4 md:grid-cols-3">
            {copy.cards.map((card) => (
              <article
                key={card.href}
                className="rounded-2xl border border-stone-200/90 bg-stone-50/90 p-5 dark:border-stone-700 dark:bg-stone-800/70"
              >
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {card.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-700 dark:text-stone-200">
                  {card.description}
                </p>
                <Link
                  href={card.href}
                  className="mt-4 inline-flex text-sm font-semibold text-amber-800 hover:text-amber-700 dark:text-amber-200 dark:hover:text-amber-100"
                >
                  {copy.cta}
                </Link>
              </article>
            ))}
          </section>
        </div>
      </main>
      <HomeFooter
        note={legalT('footerNote')}
        imprintLabel={legalT('imprint.title')}
        privacyLabel={legalT('privacy.title')}
      />
    </div>
  );
}
