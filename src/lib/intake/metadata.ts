import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { localeToPathPrefix } from '@/lib/seo';

export function createInternalMetadata({
  locale,
  path,
  title,
  description,
  baseUrl,
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
  baseUrl?: string;
}): Metadata {
  const prefix = localeToPathPrefix(locale);
  const canonicalPath = `${prefix}${path.startsWith('/') ? path : `/${path}`}`;
  const metadataBaseUrl = baseUrl || siteConfig.url;

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: canonicalPath,
    },
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        'max-snippet': 0,
        'max-image-preview': 'none',
        'max-video-preview': 0,
      },
    },
    openGraph: {
      type: 'website',
      url: `${metadataBaseUrl}${canonicalPath}`,
      title,
      description,
      siteName: siteConfig.name,
    },
  };
}
