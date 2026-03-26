import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;
  const now = new Date();

  const routes = [
    '/',
    '/en',
    '/pfl',
    '/leistungen/webdesign-pfalz',
    '/branchen',
    '/branchen/ferienwohnung-website',
    '/branchen/restaurant-website',
    '/branchen/weingut-sektgut-website',
    '/en/leistungen/webdesign-pfalz',
    '/en/branchen',
    '/en/branchen/ferienwohnung-website',
    '/en/branchen/restaurant-website',
    '/en/branchen/weingut-sektgut-website',
    '/pfl/leistungen/webdesign-pfalz',
    '/pfl/branchen',
    '/pfl/branchen/ferienwohnung-website',
    '/pfl/branchen/restaurant-website',
    '/pfl/branchen/weingut-sektgut-website',
    '/impressum',
    '/datenschutz',
    '/en/impressum',
    '/en/datenschutz',
    '/pfl/impressum',
    '/pfl/datenschutz',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency:
      route.includes('impressum') || route.includes('datenschutz')
        ? 'monthly'
        : 'weekly',
    priority:
      route === '/' ? 1 : route === '/en' || route === '/pfl' ? 0.9 : 0.5,
  }));
}
