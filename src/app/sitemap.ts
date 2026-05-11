import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import seoRoutes from '@/config/seo-routes.json';

type SeoRouteDefinition = {
  path: string;
  lastModified: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;
  return (seoRoutes as SeoRouteDefinition[]).map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(route.lastModified),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
