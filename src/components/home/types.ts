export type CardItem = {
  title: string;
  description: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type PackageItem = {
  name: string;
  description: string;
  highlights: string[];
};

export type ContactDetails = {
  personLabel: string;
  ownerName: string;
  emailLabel: string;
  emailValue: string;
  phoneLabel: string;
  phoneValue: string;
  whatsAppLabel: string;
  whatsAppValue: string;
  addressLabel: string;
  addressLines: string[];
  regionNote: string;
};

export type SupportedLocale = 'de' | 'en' | 'pfl';

export type ThemeToggleCopy = {
  light: string;
  dark: string;
  toggle: string;
};

export type LanguageToggleCopy = {
  toggle: string;
  options: Record<SupportedLocale, string>;
};

export type ContactFormCopy = {
  eyebrow: string;
  title: string;
  description: string;
  openCta: string;
  closeCta: string;
  submit: string;
  privacyNote: string;
  privacyLinkLabel: string;
  status: {
    loading: string;
    success: string;
    error: string;
    botCheckPending: string;
    botCheckFailed: string;
  };
  validation: {
    nameMin: string;
    businessMax: string;
    emailRequired: string;
    emailInvalid: string;
    phoneMax: string;
    messageMin: string;
  };
  fields: {
    name: {
      label: string;
      placeholder: string;
    };
    business: {
      label: string;
      placeholder: string;
    };
    email: {
      label: string;
      placeholder: string;
    };
    phone: {
      label: string;
      placeholder: string;
    };
    message: {
      label: string;
      placeholder: string;
    };
  };
};

export type ContactEmailRevealCopy = {
  title: string;
  description: string;
  verifyCta: string;
  openMailCta: string;
  loading: string;
  success: string;
  unavailable: string;
};

export type NavItem = {
  label: string;
  href: string;
};

export type MobileNavItem = NavItem & {
  shortLabel: string;
};

export type SeoLinkItem = {
  label: string;
  href: string;
  description: string;
};

export type HomePageData = {
  appName: string;
  locale: SupportedLocale;
  accessibility: {
    skipToContentLabel: string;
    primaryNavigationLabel: string;
  };
  controls: {
    currentLocale: SupportedLocale;
    language: LanguageToggleCopy;
    theme: ThemeToggleCopy;
  };
  navItems: NavItem[];
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
    secondaryCtaHref: string;
    trustTitle: string;
    trustItems: string[];
  };
  introduction: {
    eyebrow: string;
    title: string;
    description: string;
    points: string[];
    conclusion: string;
    portrait?: {
      src: string;
      alt: string;
      name: string;
      label: string;
    };
  };
  services: {
    title: string;
    items: CardItem[];
  };
  seoLinks: {
    title: string;
    ctaLabel: string;
    items: SeoLinkItem[];
  };
  audiences: {
    title: string;
    items: string[];
  };
  whyMe: {
    title: string;
    items: string[];
  };
  packages: {
    title: string;
    note: string;
    supportNote: string;
    detailsCta: string;
    modalIncludesTitle: string;
    items: PackageItem[];
  };
  process: {
    title: string;
    steps: string[];
  };
  faq: {
    title: string;
    items: FaqItem[];
  };
  contact: {
    navLabel: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    tertiaryCta: string;
    openFormLabel: string;
    revealEnabled: boolean;
    whatsAppMessage: string;
    privacyHref: string;
    form: ContactFormCopy;
    emailReveal: ContactEmailRevealCopy;
    details: ContactDetails;
  };
  footer: {
    note: string;
    imprintLabel: string;
    privacyLabel: string;
    whatsAppLabel: string;
    whatsAppHref?: string;
    imprintHref: string;
    privacyHref: string;
  };
};
