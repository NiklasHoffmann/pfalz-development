import type { MobileNavItem, SupportedLocale } from '@/components/home/types';
import { siteConfig } from '@/config/site';
import { buildWhatsAppHref } from '@/lib/whatsapp';

export function getCurrentLocale(locale: string): SupportedLocale {
  return locale === 'en' || locale === 'pfl' ? locale : 'de';
}

export function localeToBasePath(locale: string): string {
  return getCurrentLocale(locale) === 'de'
    ? ''
    : `/${getCurrentLocale(locale)}`;
}

export function getAdminRootPath(locale: string): string {
  const basePath = localeToBasePath(locale);

  return `${basePath}/admin`;
}

export function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export function stripLocalePrefix(pathname: string): string {
  const normalizedPathname = normalizePathname(pathname);

  if (normalizedPathname === '/') {
    return '/';
  }

  const segments = normalizedPathname.split('/').filter(Boolean);
  const [firstSegment, ...restSegments] = segments;

  if (!firstSegment || !['de', 'en', 'pfl'].includes(firstSegment)) {
    return normalizedPathname;
  }

  return restSegments.length > 0 ? `/${restSegments.join('/')}` : '/';
}

export function getIndustryNavLabel(locale: string): string {
  return getCurrentLocale(locale) === 'en' ? 'Industry' : 'Branche';
}

export function getMobileShortLabels(locale: string): {
  home: string;
  service: string;
  industry: string;
  whatsapp: string;
} {
  const currentLocale = getCurrentLocale(locale);

  if (currentLocale === 'en') {
    return {
      home: 'Home',
      service: 'Service',
      industry: 'Industry',
      whatsapp: 'WhatsApp',
    };
  }

  if (currentLocale === 'pfl') {
    return {
      home: 'Schtardt',
      service: 'Leischdung',
      industry: 'Branche',
      whatsapp: 'WhatsApp',
    };
  }

  return {
    home: 'Start',
    service: 'Leistung',
    industry: 'Branche',
    whatsapp: 'WhatsApp',
  };
}

export function getMobileNavigationLabel(locale: string): string {
  return getCurrentLocale(locale) === 'en'
    ? 'Mobile navigation'
    : 'Mobile Navigation';
}

export function getNavigationLabels(locale: string): {
  home: string;
  about: string;
  whatsapp: string;
} {
  const currentLocale = getCurrentLocale(locale);

  if (currentLocale === 'en') {
    return {
      home: 'Home',
      about: 'About',
      whatsapp: 'WhatsApp',
    };
  }

  if (currentLocale === 'pfl') {
    return {
      home: 'Schtardt',
      about: 'Leischdunge',
      whatsapp: 'WhatsApp',
    };
  }

  return {
    home: 'Start',
    about: 'Leistungen',
    whatsapp: 'WhatsApp',
  };
}

export function getMobileDockItems(
  locale: string,
  labels: {
    home: string;
    about: string;
    whatsapp: string;
  }
): MobileNavItem[] {
  const basePath = localeToBasePath(locale);
  const homeHref = basePath || '/';
  const shortLabels = getMobileShortLabels(locale);
  const whatsAppMessageByLocale = {
    de: 'Hallo, ich interessiere mich für eine Website für meinen Betrieb in der Pfalz. Ich würde gern kurz über mein Projekt sprechen.',
    en: 'Hello, I am interested in a website for my business in the Palatinate. I would like to briefly discuss my project.',
    pfl: 'Hallo, isch interessier mich fer e Website fer mei Betrieb in de Palz. Isch würd gern kurz iwwer mei Projekt babble.',
  } as const;
  const currentLocale = getCurrentLocale(locale);
  const whatsAppHref = buildWhatsAppHref(
    siteConfig.contact.whatsAppDisplay,
    whatsAppMessageByLocale[currentLocale]
  );

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
      label: labels.whatsapp,
      href: whatsAppHref,
      shortLabel: shortLabels.whatsapp,
    },
  ];
}

export function getDockLogicalPath(pathname: string): string {
  return stripLocalePrefix(pathname);
}
