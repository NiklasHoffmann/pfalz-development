import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/routing';

interface ImpressumPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ImpressumPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal' });

  return {
    title: t('imprint.title'),
    description: t('imprint.noticeText'),
  };
}

export default async function ImpressumPage({ params }: ImpressumPageProps) {
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
            {t('imprint.eyebrow')}
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">
            {t('imprint.title')}
          </h1>

          <div className="mt-8 space-y-8 text-sm leading-7 text-stone-700 dark:text-stone-300">
            <section>
              <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                {t('imprint.providerTitle')}
              </h2>
              <p className="mt-3">Niklas Hoffmann</p>
              <p>Fröbelstraße 20</p>
              <p>67433 Neustadt an der Weinstraße</p>
              <p>Deutschland</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                {t('imprint.contactTitle')}
              </h2>
              <p className="mt-3">
                E-Mail:{' '}
                <a
                  href="mailto:kontakt@pfalz-development.de"
                  className="font-medium text-amber-700 hover:underline dark:text-amber-300"
                >
                  kontakt@pfalz-development.de
                </a>
              </p>
              <p className="mt-2">
                {t('imprint.phoneLabel')}:{' '}
                <a
                  href="tel:+4963211876643"
                  className="font-medium text-amber-700 hover:underline dark:text-amber-300"
                >
                  06321 1876643
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                {t('imprint.responsibleTitle')}
              </h2>
              <p className="mt-3">Niklas Hoffmann</p>
              <p>Fröbelstraße 20</p>
              <p>67433 Neustadt an der Weinstraße</p>
              <p>Deutschland</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                {t('imprint.vatIdTitle')}
              </h2>
              <p className="mt-3">{t('imprint.vatIdText')}</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                {t('imprint.disputeResolutionTitle')}
              </h2>
              <p className="mt-3">{t('imprint.disputeResolutionText')}</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                {t('imprint.liabilityContentTitle')}
              </h2>
              <p className="mt-3">{t('imprint.liabilityContentText')}</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                {t('imprint.liabilityLinksTitle')}
              </h2>
              <p className="mt-3">{t('imprint.liabilityLinksText')}</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
                {t('imprint.copyrightTitle')}
              </h2>
              <p className="mt-3">{t('imprint.copyrightText')}</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
