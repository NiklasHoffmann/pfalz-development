import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

const CORE_LAST_MODIFIED = new Date('2026-04-12T00:00:00.000Z');
const LEGAL_LAST_MODIFIED = new Date('2026-03-01T00:00:00.000Z');

function getLastModified(route: string): Date {
  return route.includes('impressum') || route.includes('datenschutz')
    ? LEGAL_LAST_MODIFIED
    : CORE_LAST_MODIFIED;
}

function getPriority(route: string): number {
  if (route === '/') return 1;
  if (route === '/leistungen') return 0.9;
  if (route === '/en' || route === '/pfl') return 0.9;
  if (
    route === '/en/leistungen' ||
    route === '/pfl/leistungen' ||
    route === '/branchen' ||
    route === '/orte' ||
    route === '/en/branchen' ||
    route === '/en/orte' ||
    route === '/pfl/branchen' ||
    route === '/pfl/orte'
  ) {
    return 0.8;
  }
  if (route.includes('impressum') || route.includes('datenschutz')) {
    return 0.2;
  }

  return 0.7;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  const routes = [
    '/',
    '/en',
    '/pfl',
    '/leistungen',
    '/leistungen/webdesign-pfalz',
    '/leistungen/webentwicklung-pfalz',
    '/leistungen/website-relaunch',
    '/leistungen/website-wartung',
    '/branchen',
    '/branchen/ferienwohnung-website',
    '/branchen/restaurant-website',
    '/branchen/weingut-sektgut-website',
    '/orte',
    '/orte/webdesign-neustadt',
    '/orte/webdesign-landau',
    '/orte/webdesign-speyer',
    '/en/leistungen',
    '/en/leistungen/webdesign-pfalz',
    '/en/leistungen/webentwicklung-pfalz',
    '/en/leistungen/website-relaunch',
    '/en/leistungen/website-wartung',
    '/en/branchen',
    '/en/branchen/ferienwohnung-website',
    '/en/branchen/restaurant-website',
    '/en/branchen/weingut-sektgut-website',
    '/en/orte',
    '/en/orte/webdesign-neustadt',
    '/en/orte/webdesign-landau',
    '/en/orte/webdesign-speyer',
    '/pfl/leistungen',
    '/pfl/leistungen/webdesign-pfalz',
    '/pfl/leistungen/webentwicklung-pfalz',
    '/pfl/leistungen/website-relaunch',
    '/pfl/leistungen/website-wartung',
    '/pfl/branchen',
    '/pfl/branchen/ferienwohnung-website',
    '/pfl/branchen/restaurant-website',
    '/pfl/branchen/weingut-sektgut-website',
    '/pfl/orte',
    '/pfl/orte/webdesign-neustadt',
    '/pfl/orte/webdesign-landau',
    '/pfl/orte/webdesign-speyer',
    '/impressum',
    '/datenschutz',
    '/en/impressum',
    '/en/datenschutz',
    '/pfl/impressum',
    '/pfl/datenschutz',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: getLastModified(route),
    changeFrequency:
      route.includes('impressum') || route.includes('datenschutz')
        ? 'monthly'
        : 'weekly',
    priority: getPriority(route),
  }));
}
