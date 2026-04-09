export const siteConfig = {
  name: 'Pfalz Development',
  description:
    'Webdesign und professionelle Websites für Unternehmen in der Pfalz - Neustadt an der Weinstraße, Landau und Umgebung.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: '/pfalz-development-logo-light.png',
  links: {
    github: 'https://github.com/NiklasHoffmann/pfalz-development',
  },
  creator: {
    name: 'Niklas Hoffmann',
    url: 'https://github.com/NiklasHoffmann',
  },
};

export type SiteConfig = typeof siteConfig;
