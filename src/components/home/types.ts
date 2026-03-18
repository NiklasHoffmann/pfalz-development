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
};

export type ContactDetails = {
  personLabel: string;
  ownerName: string;
  emailLabel: string;
  emailValue: string;
  phoneLabel: string;
  phoneValue: string;
  addressLabel: string;
  addressLines: string[];
  regionNote: string;
};

export type NavItem = {
  label: string;
  href: string;
};

export type MobileNavItem = NavItem & {
  shortLabel: string;
};

export type HomePageData = {
  appName: string;
  navItems: NavItem[];
  mobileNavItems: MobileNavItem[];
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
    trustTitle: string;
    trustItems: string[];
  };
  services: {
    title: string;
    items: CardItem[];
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
    details: ContactDetails;
  };
  footer: {
    note: string;
    imprintLabel: string;
    privacyLabel: string;
  };
};
