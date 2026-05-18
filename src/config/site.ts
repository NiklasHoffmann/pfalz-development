export const siteConfig = {
  name: 'Pfalz Development',
  description:
    'Webdesign, Website-Erstellung und lokale SEO-Grundlagen für Unternehmen in der Pfalz - für Neustadt an der Weinstraße, Landau und Umgebung.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: '/opengraph-image',
  contact: {
    email: 'kontakt@pfalz-development.de',
    imprintEmail: 'impressum@pfalz-development.de',
    privacyEmail: 'datenschutz@pfalz-development.de',
    phoneDisplay: '06321 1876643',
    phoneHref: '+4963211876643',
    whatsAppDisplay: '+49 179 1565808',
  },
  links: {
    github: 'https://github.com/NiklasHoffmann/pfalz-development',
  },
  creator: {
    name: 'Niklas Hoffmann',
    url: 'https://github.com/NiklasHoffmann',
  },
};

export type SiteConfig = typeof siteConfig;
