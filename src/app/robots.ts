import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/projekt/',
        '/fragebogen/',
        '/en/admin/',
        '/en/projekt/',
        '/en/fragebogen/',
        '/pfl/admin/',
        '/pfl/projekt/',
        '/pfl/fragebogen/',
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
