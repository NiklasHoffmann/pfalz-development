import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';
import { LocaleMobileDock } from '@/components/layouts/LocaleMobileDock';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ScrollToTopButton } from '@/components/ui/ScrollToTopButton';
import { siteConfig } from '@/config/site';
import { NONCE_HEADER_NAME } from '@/lib/csp';
import { localeToHtmlLang } from '@/lib/seo';
import { routing } from '@/routing';
import '../globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [
      {
        url: '/favicon_light.ico',
        type: 'image/x-icon',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/favicon_dark.ico',
        type: 'image/x-icon',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/favicon_light.png',
        type: 'image/png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/favicon_dark.png',
        type: 'image/png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: '/favicon_light.png',
  },
  keywords: [
    'Webdesign Pfalz',
    'Website erstellen lassen Pfalz',
    'Webentwickler Neustadt an der Weinstraße',
    'Webdesign Landau',
    'Website für Ferienwohnung',
    'Website für Restaurant',
    'Lokale SEO Pfalz',
  ],
  authors: [
    {
      name: siteConfig.creator.name,
      url: siteConfig.creator.url,
    },
  ],
  creator: siteConfig.creator.name,
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'geo.region': 'DE-RP',
    'geo.placename': 'Neustadt an der Weinstraße',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fcfbf7' },
    { media: '(prefers-color-scheme: dark)', color: '#2c2623' },
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

async function resolveLocale(params: Promise<unknown>) {
  const value = (await params) as { locale?: string } | undefined;
  return routing.locales.includes(
    value?.locale as (typeof routing.locales)[number]
  )
    ? (value?.locale as (typeof routing.locales)[number])
    : routing.defaultLocale;
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<unknown>;
}) {
  const locale = await resolveLocale(params);
  const nonce = (await headers()).get(NONCE_HEADER_NAME) ?? undefined;
  setRequestLocale(locale);

  return (
    <html
      lang={localeToHtmlLang(locale)}
      suppressHydrationWarning
      className="loading"
    >
      <head>
        <link
          rel="preconnect"
          href="https://challenges.cloudflare.com"
          crossOrigin=""
        />
        <link rel="dns-prefetch" href="//challenges.cloudflare.com" />
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('nextjs-theme') || 'system';
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  const effectiveTheme = theme === 'system' ? systemTheme : theme;
                  
                  if (effectiveTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  
                  // Remove loading class after theme is set
                  document.documentElement.classList.remove('loading');
                } catch (e) {
                  document.documentElement.classList.remove('loading');
                }
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          nonce={nonce}
          storageKey="nextjs-theme"
        >
          {children}
          <LocaleMobileDock locale={locale} />
          <ScrollToTopButton locale={locale as 'de' | 'en' | 'pfl'} />
        </ThemeProvider>
      </body>
    </html>
  );
}
