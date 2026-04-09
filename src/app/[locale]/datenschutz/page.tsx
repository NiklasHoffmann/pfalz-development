import type { Metadata } from 'next';
import { HomeFooter } from '@/components/home/HomeFooter';
import { HomeHeader } from '@/components/home/HomeHeader';
import type { NavItem } from '@/components/home/types';
import { siteConfig } from '@/config/site';
import { getHeaderControlsCopy } from '@/lib/locale-ui';
import { getTranslations } from 'next-intl/server';
import { createPageMetadata, PALATINATE_HREFLANG } from '@/lib/seo';

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

const pathByLocale = {
  de: '/datenschutz',
  en: '/en/datenschutz',
  pfl: '/pfl/datenschutz',
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
}: PrivacyPageProps): Promise<Metadata> {
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
    title: t('privacy.title'),
    description: t('privacy.overviewText'),
  });
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });
  const navT = await getTranslations({ locale, namespace: 'navigation' });
  const homeHref = locale === 'de' ? '/' : `/${locale}`;
  const basePath = locale === 'de' ? '' : `/${locale}`;
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
        controls={getHeaderControlsCopy(locale)}
      />
      <main className="flex-1 px-4 pb-28 pt-28 text-stone-900 dark:text-stone-100 sm:px-6 sm:pt-32 md:pb-16 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="bg-white/88 mx-auto max-w-5xl rounded-[2rem] border border-stone-200/80 p-8 shadow-[0_20px_56px_rgba(28,25,23,0.08)] dark:border-stone-700/80 dark:bg-stone-900/55 dark:shadow-[0_24px_64px_rgba(0,0,0,0.28)] sm:p-10">
            <a
              href={homeHref}
              className="text-sm font-medium text-amber-700 transition hover:text-amber-600 dark:text-amber-300 dark:hover:text-amber-200"
            >
              {t('backToHome')}
            </a>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-300">
              {t('privacy.eyebrow')}
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-stone-950 dark:text-stone-50">
              {t('privacy.title')}
            </h1>

            <div className="mt-10 space-y-8 text-sm leading-7 text-stone-700 dark:text-stone-300">
              <section>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('privacy.overviewTitle')}
                </h2>
                <p className="mt-3">{t('privacy.overviewText')}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('privacy.responsibleTitle')}
                </h2>
                <p className="mt-3">Niklas Hoffmann</p>
                <p>Fröbelstraße 20</p>
                <p>67433 Neustadt an der Weinstraße</p>
                <p>
                  E-Mail:{' '}
                  <a
                    href="mailto:kontakt@pfalz-development.de"
                    className="font-medium text-amber-700 hover:underline dark:text-amber-300"
                  >
                    kontakt@pfalz-development.de
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('privacy.dataTypesTitle')}
                </h2>
                <p className="mt-3">{t('privacy.dataTypesText')}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('privacy.purposesTitle')}
                </h2>
                <p className="mt-3">{t('privacy.purposesText')}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('privacy.legalBasisTitle')}
                </h2>
                <p className="mt-3">{t('privacy.legalBasisText')}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('privacy.contactRequestsTitle')}
                </h2>
                <p className="mt-3">{t('privacy.contactRequestsText')}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('privacy.serverLogsTitle')}
                </h2>
                <p className="mt-3">{t('privacy.serverLogsText')}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('privacy.cookiesTitle')}
                </h2>
                <p className="mt-3">{t('privacy.cookiesText')}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('privacy.recipientsTitle')}
                </h2>
                <p className="mt-3">{t('privacy.recipientsText')}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('privacy.processorsTitle')}
                </h2>
                <p className="mt-3">{t('privacy.processorsText')}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('privacy.storageTitle')}
                </h2>
                <p className="mt-3">{t('privacy.storageText')}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('privacy.securityTitle')}
                </h2>
                <p className="mt-3">{t('privacy.securityText')}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('privacy.rightsTitle')}
                </h2>
                <p className="mt-3">{t('privacy.rightsText')}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('privacy.revocationTitle')}
                </h2>
                <p className="mt-3">{t('privacy.revocationText')}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('privacy.complaintTitle')}
                </h2>
                <p className="mt-3">{t('privacy.complaintText')}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('privacy.dpoTitle')}
                </h2>
                <p className="mt-3">{t('privacy.dpoText')}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                  {t('privacy.statusTitle')}
                </h2>
                <p className="mt-3">{t('privacy.statusText')}</p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <HomeFooter
        note={t('footerNote')}
        imprintLabel={t('imprint.title')}
        privacyLabel={t('privacy.title')}
        imprintHref={`${basePath}/impressum`}
        privacyHref={`${basePath}/datenschutz`}
      />
    </div>
  );
}
