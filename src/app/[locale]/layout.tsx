import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { siteConfig } from '@/config/site';
import { routing } from '@/routing';
import '../globals.css';

const bodyFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: '/pfalz-development-favicon.ico',
    shortcut: '/pfalz-development-favicon.ico',
    apple: '/pfalz-development-favicon.ico',
  },
  keywords: [
    'Webdesign Pfalz',
    'Website erstellen lassen Pfalz',
    'Webentwickler Neustadt an der Weinstrasse',
    'Webdesign Landau',
    'Website fuer Ferienwohnung',
    'Website fuer Restaurant',
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
  alternates: {
    canonical: '/',
    languages: {
      de: '/',
      en: '/en',
      'x-default': '/',
    },
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
    'geo.placename': 'Neustadt an der Weinstrasse',
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const messages = (await getMessages({ locale })) as Record<string, unknown>;
  const clientMessages = {
    language: messages.language,
    theme: messages.theme,
    common: {
      home: {
        contact: {
          form: (
            (messages.common as Record<string, unknown>)?.home as Record<
              string,
              unknown
            >
          )?.contact
            ? ((
                (
                  (messages.common as Record<string, unknown>).home as Record<
                    string,
                    unknown
                  >
                ).contact as Record<string, unknown>
              ).form as Record<string, unknown>)
            : {},
        },
      },
    },
  };

  return (
    <html lang={locale} suppressHydrationWarning className="loading">
      <head>
        <script
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
      <body suppressHydrationWarning className={bodyFont.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="nextjs-theme"
        >
          <NextIntlClientProvider messages={clientMessages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
