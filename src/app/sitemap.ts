import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;
  const now = new Date();

  const routes = [
    '/',
    '/en',
    '/pfl',
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
