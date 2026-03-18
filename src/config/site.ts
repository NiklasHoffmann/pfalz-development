export const siteConfig = {
  name: 'Pfalz Development',
  description:
    'Webdesign und professionelle Websites fuer Unternehmen in der Pfalz - Neustadt an der Weinstrasse, Landau und Umgebung.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: '/logo-pfalz-development.webp',
  links: {
    github: 'https://github.com/NiklasHoffmann/pfalz-development',
  },
  creator: {
    name: 'Niklas Hoffmann',
    url: 'https://github.com/NiklasHoffmann',
  },
};

export type SiteConfig = typeof siteConfig;
