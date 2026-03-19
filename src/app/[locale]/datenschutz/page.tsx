import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/routing';

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });

  return {
    title: t('privacy.title'),
    description: t('privacy.overviewText'),
  };
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16 text-stone-900 dark:bg-stone-950 dark:text-stone-100 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="text-sm font-medium text-amber-700 transition hover:text-amber-600 dark:text-amber-300 dark:hover:text-amber-200"
        >
          {t('backToHome')}
        </Link>

        <div className="mt-6 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-300">
            {t('privacy.eyebrow')}
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">
            {t('privacy.title')}
          </h1>

          <div className="mt-8 space-y-8 text-sm leading-7 text-stone-700 dark:text-stone-300">
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
  );
}
