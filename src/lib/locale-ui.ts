import type { HomePageData, SupportedLocale } from '@/components/home/types';

export function getHeaderControlsCopy(
  locale: string
): HomePageData['controls'] {
  const currentLocale = locale === 'en' || locale === 'pfl' ? locale : 'de';

  if (currentLocale === 'en') {
    return {
      currentLocale,
      language: {
        toggle: 'Switch language',
        options: {
          de: 'German',
          en: 'English',
          pfl: 'Palatine',
        },
      },
      theme: {
        light: 'Light',
        dark: 'Dark',
        toggle: 'Toggle theme',
      },
    };
  }

  if (currentLocale === 'pfl') {
    return {
      currentLocale,
      language: {
        toggle: 'Sprooch wechsle',
        options: {
          de: 'Deutsch',
          en: 'Englisch',
          pfl: 'Paelzisch',
        },
      },
      theme: {
        light: 'Hell',
        dark: 'Dungel',
        toggle: 'Design wechsle',
      },
    };
  }

  return {
    currentLocale: currentLocale as SupportedLocale,
    language: {
      toggle: 'Sprache wechseln',
      options: {
        de: 'Deutsch',
        en: 'Englisch',
        pfl: 'Pfaelzisch',
      },
    },
    theme: {
      light: 'Hell',
      dark: 'Dunkel',
      toggle: 'Design wechseln',
    },
  };
}
