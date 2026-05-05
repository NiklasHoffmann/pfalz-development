import { headers } from 'next/headers';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ScrollToTopButton } from '@/components/ui/ScrollToTopButton';
import { NotFoundPage } from '@/components/ui/NotFoundPage';
import { NONCE_HEADER_NAME } from '@/lib/csp';

const copy = {
  eyebrow: 'Falsch abgebogen, nicht verloren',
  description:
    'Diese Adresse passt aktuell zu keiner erreichbaren Seite von Pfalz Development. Möglicherweise ist der Link veraltet oder die URL wurde falsch eingegeben.',
  hintTitle: 'Was du jetzt tun kannst',
  hints: [
    'Prüfe die Adresse auf Tippfehler.',
    'Gehe zurück zur Startseite und starte von dort neu.',
    'Nutze die Leistungsseiten oder den Kontaktbereich, wenn du etwas Bestimmtes suchst.',
  ],
  servicesLabel: 'Leistungen ansehen',
  contactLabel: 'Kontakt öffnen',
  statusLabel: 'HTTP-Status',
  statusValue: '404 - Seite nicht gefunden',
  supportTitle: 'Du suchst trotzdem die richtige Seite?',
  supportText:
    'Wenn du eigentlich eine Leistungs-, Projekt- oder Kontaktseite erreichen wolltest, gehe über die Startseite weiter. So landest du sicher in der richtigen Struktur.',
};

export default async function GlobalNotFound() {
  const nonce = (await headers()).get(NONCE_HEADER_NAME) ?? undefined;

  return (
    <html lang="de" suppressHydrationWarning className="loading">
      <head>
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
          <NotFoundPage
            title="Seite nicht gefunden"
            backToHomeLabel="Zurück zur Startseite"
            homeHref="/"
            servicesHref="/leistungen"
            contactHref="/#kontakt"
            copy={copy}
          />
          <ScrollToTopButton locale="de" />
        </ThemeProvider>
      </body>
    </html>
  );
}
