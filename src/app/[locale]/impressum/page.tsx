import type { Metadata } from 'next';
import { HomeFooter } from '@/components/home/HomeFooter';
import { HomeHeader } from '@/components/home/HomeHeader';
import type { NavItem } from '@/components/home/types';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';
import { siteConfig } from '@/config/site';
import { getHeaderControlsCopy } from '@/lib/header-controls.server';
import { buildWhatsAppHref } from '@/lib/whatsapp';
import { getTranslations } from 'next-intl/server';
import { createPageMetadata, PALATINATE_HREFLANG } from '@/lib/seo';

interface ImpressumPageProps {
  params: Promise<{ locale: string }>;
}

const pathByLocale = {
  de: '/impressum',
  en: '/en/impressum',
  pfl: '/pfl/impressum',
} as const;

function getIndustryNavLabel(locale: string): string {
  if (locale === 'en') return 'Industry';
  if (locale === 'pfl') return 'Branche';
  return 'Branche';
}

function getPrimaryNavigationLabel(locale: string, appName: string): string {
  if (locale === 'en') return `${appName} primary navigation`;
  return `${appName} Hauptnavigation`;
}

export async function generateMetadata({
  params,
}: ImpressumPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });
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
    title: t('imprint.title'),
    description: t('imprint.noticeText'),
  });
}

export default async function ImpressumPage({ params }: ImpressumPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });
  const navT = await getTranslations({ locale, namespace: 'navigation' });
  const commonT = await getTranslations({ locale, namespace: 'common' });
  const homeHref = locale === 'de' ? '/' : `/${locale}`;
  const basePath = locale === 'de' ? '' : `/${locale}`;
  const footerWhatsAppHref = buildWhatsAppHref(
    siteConfig.contact.whatsAppDisplay,
    commonT('home.contact.whatsAppMessage')
  );
  const headerControls = await getHeaderControlsCopy(locale);
  const navItems: NavItem[] = [
    { label: navT('home'), href: homeHref },
    { label: navT('about'), href: `${basePath}/leistungen` },
    { label: getIndustryNavLabel(locale), href: `${basePath}/branchen` },
    { label: navT('contact'), href: `${homeHref}#kontakt` },
  ];

  return (
    <div className="surface-page flex min-h-screen flex-col">
      <HomeHeader
        appName={siteConfig.name}
        navItems={navItems}
        brandHref={homeHref}
        navAriaLabel={getPrimaryNavigationLabel(locale, siteConfig.name)}
        controls={headerControls}
      />
      <main className="flex-1 px-4 pb-28 pt-28 text-stone-900 dark:text-stone-100 sm:px-6 sm:pt-32 md:pb-16 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <RevealOnScroll className="bg-white/88 mx-auto max-w-5xl rounded-[2rem] border border-stone-200/80 p-8 shadow-[0_20px_56px_rgba(28,25,23,0.08)] dark:border-stone-700/80 dark:bg-stone-900/55 dark:shadow-[0_24px_64px_rgba(0,0,0,0.28)] sm:p-10">
            <a
              href={homeHref}
              className="text-sm font-medium text-amber-700 transition hover:text-amber-600 dark:text-amber-300 dark:hover:text-amber-200"
            >
              {t('backToHome')}
            </a>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-300">
              {t('imprint.eyebrow')}
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-stone-950 dark:text-stone-50">
              {t('imprint.title')}
            </h1>

            <div className="mt-10 space-y-8 text-sm leading-7 text-stone-700 dark:text-stone-300">
              <RevealOnScroll as="section" delayMs={60}>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('imprint.providerTitle')}
                </h2>
                <p className="mt-3">Niklas Hoffmann</p>
                <p>Fröbelstraße 20</p>
                <p>67433 Neustadt an der Weinstraße</p>
                <p>Deutschland</p>
              </RevealOnScroll>

              <RevealOnScroll as="section" delayMs={100}>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('imprint.contactTitle')}
                </h2>
                <p className="mt-3">
                  E-Mail:{' '}
                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    className="font-medium text-amber-700 hover:underline dark:text-amber-300"
                  >
                    {siteConfig.contact.email}
                  </a>
                </p>
                <p className="mt-2">
                  {t('imprint.phoneLabel')}:{' '}
                  <a
                    href={`tel:${siteConfig.contact.phoneHref}`}
                    className="font-medium text-amber-700 hover:underline dark:text-amber-300"
                  >
                    {siteConfig.contact.phoneDisplay}
                  </a>
                </p>
                <p className="mt-2">
                  {t('imprint.whatsAppLabel')}:{' '}
                  <a
                    href={footerWhatsAppHref}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-amber-700 hover:underline dark:text-amber-300"
                  >
                    {siteConfig.contact.whatsAppDisplay}
                  </a>
                </p>
              </RevealOnScroll>

              <RevealOnScroll as="section" delayMs={140}>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('imprint.responsibleTitle')}
                </h2>
                <p className="mt-3">Niklas Hoffmann</p>
                <p>Fröbelstraße 20</p>
                <p>67433 Neustadt an der Weinstraße</p>
                <p>Deutschland</p>
              </RevealOnScroll>

              <RevealOnScroll as="section" delayMs={180}>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('imprint.vatIdTitle')}
                </h2>
                <p className="mt-3">{t('imprint.vatIdText')}</p>
              </RevealOnScroll>

              <RevealOnScroll as="section" delayMs={220}>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('imprint.disputeResolutionTitle')}
                </h2>
                <p className="mt-3">{t('imprint.disputeResolutionText')}</p>
              </RevealOnScroll>

              <RevealOnScroll as="section" delayMs={260}>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('imprint.liabilityContentTitle')}
                </h2>
                <p className="mt-3">{t('imprint.liabilityContentText')}</p>
              </RevealOnScroll>

              <RevealOnScroll as="section" delayMs={300}>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('imprint.liabilityLinksTitle')}
                </h2>
                <p className="mt-3">{t('imprint.liabilityLinksText')}</p>
              </RevealOnScroll>

              <RevealOnScroll as="section" delayMs={340}>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('imprint.copyrightTitle')}
                </h2>
                <p className="mt-3">{t('imprint.copyrightText')}</p>
              </RevealOnScroll>
            </div>
          </RevealOnScroll>
        </div>
      </main>
      <HomeFooter
        note={t('footerNote')}
        imprintLabel={t('imprint.title')}
        privacyLabel={t('privacy.title')}
        whatsAppLabel={t('footerWhatsAppCta')}
        whatsAppHref={footerWhatsAppHref}
        imprintHref={`${basePath}/impressum`}
        privacyHref={`${basePath}/datenschutz`}
      />
    </div>
  );
}
