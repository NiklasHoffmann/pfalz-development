import { getTranslations } from 'next-intl/server';
import type { HomePageData, SupportedLocale } from '@/components/home/types';
import { getCurrentLocale } from '@/lib/locale-ui';

export async function getHeaderControlsCopy(
  locale: string
): Promise<HomePageData['controls']> {
  const currentLocale = getCurrentLocale(locale);
  const languageT = await getTranslations({ locale, namespace: 'language' });
  const themeT = await getTranslations({ locale, namespace: 'theme' });

  return {
    currentLocale: currentLocale as SupportedLocale,
    language: {
      toggle: languageT('toggle'),
      options: {
        de: languageT('de'),
        en: languageT('en'),
        pfl: languageT('pfl'),
      },
    },
    theme: {
      light: themeT('light'),
      dark: themeT('dark'),
      toggle: themeT('toggle'),
    },
  };
}
