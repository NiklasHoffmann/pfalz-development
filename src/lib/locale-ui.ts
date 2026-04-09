import type {
  HomePageData,
  MobileNavItem,
  SupportedLocale,
} from '@/components/home/types';

export function getCurrentLocale(locale: string): SupportedLocale {
  return locale === 'en' || locale === 'pfl' ? locale : 'de';
}

export function localeToBasePath(locale: string): string {
  return getCurrentLocale(locale) === 'de' ? '' : `/${getCurrentLocale(locale)}`;
}

export function getIndustryNavLabel(locale: string): string {
  return getCurrentLocale(locale) === 'en' ? 'Industry' : 'Branche';
}

export function getMobileShortLabels(locale: string): {
  home: string;
  service: string;
  industry: string;
  contact: string;
} {
  const currentLocale = getCurrentLocale(locale);

  if (currentLocale === 'en') {
    return {
      home: 'Home',
      service: 'Service',
      industry: 'Industry',
      contact: 'Contact',
    };
  }

  if (currentLocale === 'pfl') {
    return {
      home: 'Schtardt',
      service: 'Leischdung',
      industry: 'Branche',
      contact: 'Kontakt',
    };
  }

  return {
    home: 'Start',
    service: 'Leistung',
    industry: 'Branche',
    contact: 'Kontakt',
  };
}

export function getMobileNavigationLabel(locale: string): string {
  return getCurrentLocale(locale) === 'en'
    ? 'Mobile navigation'
    : 'Mobile Navigation';
}

export function getMobileDockItems(
  locale: string,
  labels: {
    home: string;
    about: string;
    contact: string;
  }
): MobileNavItem[] {
  const basePath = localeToBasePath(locale);
  const homeHref = basePath || '/';
  const shortLabels = getMobileShortLabels(locale);

  return [
    {
      label: labels.home,
      href: homeHref,
      shortLabel: shortLabels.home,
    },
    {
      label: labels.about,
      href: `${basePath}/leistungen`,
      shortLabel: shortLabels.service,
    },
    {
      label: getIndustryNavLabel(locale),
      href: `${basePath}/branchen`,
      shortLabel: shortLabels.industry,
    },
    {
      label: labels.contact,
      href: `${homeHref}#kontakt`,
      shortLabel: shortLabels.contact,
    },
  ];
}

export function getHeaderControlsCopy(
  locale: string
): HomePageData['controls'] {
  const currentLocale = getCurrentLocale(locale);

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
