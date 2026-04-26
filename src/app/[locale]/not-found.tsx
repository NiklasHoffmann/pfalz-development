import { NotFoundPage } from '@/components/ui/NotFoundPage';
import { getLocale, getTranslations } from 'next-intl/server';

function getNotFoundCopy(locale: string) {
  if (locale === 'en') {
    return {
      eyebrow: 'Wrong turn, not a dead end',
      description:
        'The page you requested is not available. The link may be outdated, the address may contain a typo, or the content may have moved.',
      hintTitle: 'What you can do now',
      hints: [
        'Check the URL for typos.',
        'Go back to the homepage and continue from there.',
        'Use the service pages if you were looking for a specific offer.',
      ],
      servicesLabel: 'View services',
      servicesHref: '/leistungen',
      contactLabel: 'Open contact options',
      contactHref: '/#kontakt',
      statusLabel: 'HTTP status',
      statusValue: '404 - Not Found',
      supportTitle: 'Need the right page anyway?',
      supportText:
        'If you were trying to reach a project, service, or intake page, use the homepage navigation or contact me directly and I will point you to the correct entry.',
    };
  }

  if (locale === 'pfl') {
    return {
      eyebrow: 'Verlaafe, awer net ferlorre',
      description:
        'Die Seite gibts grad net. Villeicht iss de Link alt, die Adresse hot en Dipper drin, odder de Inhalt is woanners hiegezoo.',
      hintTitle: 'Was de jetz mache kannscht',
      hints: [
        'Guck die Adresse noch emol no.',
        'Geh zrick uff die Schtardtseid un geh vun do weider.',
        'Benutz die Leischdungsseite, wann de ebbes Bestimmtes gsucht hoscht.',
      ],
      servicesLabel: 'Leischdunge aagugge',
      servicesHref: '/leistungen',
      contactLabel: 'Kontakt uffmache',
      contactHref: '/#kontakt',
      statusLabel: 'HTTP-Schtadus',
      statusValue: '404 - Net gfunne',
      supportTitle: 'Brauchsch trotzdem die richdiche Seid?',
      supportText:
        'Wenn de en Projekt-, Leischdungs- odder Fragebogeseid gsucht hoscht, geh iwwer die Navigation uff de Schtardtseid odder meld dich direkt.',
    };
  }

  return {
    eyebrow: 'Falsch abgebogen, nicht verloren',
    description:
      'Die angeforderte Seite ist aktuell nicht erreichbar. Möglicherweise ist der Link veraltet, die Adresse fehlerhaft oder der Inhalt wurde verschoben.',
    hintTitle: 'Was du jetzt tun kannst',
    hints: [
      'Prüfe die URL auf Tippfehler.',
      'Gehe zurück zur Startseite und navigiere von dort weiter.',
      'Nutze die Leistungsseiten, wenn du ein konkretes Angebot suchst.',
    ],
    servicesLabel: 'Leistungen ansehen',
    servicesHref: '/leistungen',
    contactLabel: 'Kontakt öffnen',
    contactHref: '/#kontakt',
    statusLabel: 'HTTP-Status',
    statusValue: '404 - Seite nicht gefunden',
    supportTitle: 'Du brauchst die richtige Seite trotzdem?',
    supportText:
      'Wenn du eigentlich eine Projekt-, Leistungs- oder Fragebogenseite gesucht hast, nutze die Navigation auf der Startseite oder melde dich direkt, dann leite ich dich passend weiter.',
  };
}

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'common' });
  const copy = getNotFoundCopy(locale);
  const homeHref = locale === 'de' ? '/' : `/${locale}`;
  const servicesHref =
    locale === 'de' ? copy.servicesHref : `/${locale}${copy.servicesHref}`;
  const contactHref =
    locale === 'de' ? copy.contactHref : `/${locale}${copy.contactHref}`;

  return (
    <NotFoundPage
      title={t('notFound')}
      backToHomeLabel={t('backToHome')}
      homeHref={homeHref}
      servicesHref={servicesHref}
      contactHref={contactHref}
      copy={copy}
    />
  );
}
