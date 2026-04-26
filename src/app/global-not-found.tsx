import './globals.css';
import { NotFoundPage } from '@/components/ui/NotFoundPage';

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

export default function GlobalNotFound() {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <NotFoundPage
          title="Seite nicht gefunden"
          backToHomeLabel="Zurück zur Startseite"
          homeHref="/"
          servicesHref="/leistungen"
          contactHref="/#kontakt"
          copy={copy}
        />
      </body>
    </html>
  );
}
