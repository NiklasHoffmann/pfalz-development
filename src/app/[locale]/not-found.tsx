import { getLocale, getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'common' });
  const homeHref = locale === 'de' ? '/' : `/${locale}`;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-900 dark:text-gray-100">
          404
        </h1>
        <h2 className="mt-4 text-3xl font-semibold text-gray-700 dark:text-gray-300">
          {t('notFound')}
        </h2>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Die angeforderte Seite konnte nicht gefunden werden.
        </p>
        <a
          href={homeHref}
          className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
        >
          {t('backToHome')}
        </a>
      </div>
    </div>
  );
}
