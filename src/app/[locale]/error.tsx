'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { SupportedLocale } from '@/components/home/types';
import { StatusPageFrame } from '@/components/ui/StatusPageFrame';

const errorCopy: Record<
  SupportedLocale,
  {
    eyebrow: string;
    generic: string;
    description: string;
    tryAgain: string;
    backToHome: string;
    supportTitle: string;
    supportText: string;
  }
> = {
  de: {
    eyebrow: 'Unerwarteter Fehler',
    generic: 'Etwas ist schief gelaufen!',
    description:
      'Die aktuelle Ansicht konnte nicht vollständig geladen oder verarbeitet werden. Du kannst den Vorgang direkt erneut anstoßen.',
    tryAgain: 'Erneut versuchen',
    backToHome: 'Zur Startseite',
    supportTitle: 'Was du jetzt tun kannst',
    supportText:
      'Versuche die Aktion erneut. Wenn der Fehler bestehen bleibt, gehe zurück zur Startseite und rufe die Seite von dort neu auf.',
  },
  en: {
    eyebrow: 'Unexpected error',
    generic: 'Something went wrong!',
    description:
      'This view could not be loaded or processed completely. You can retry the request right away.',
    tryAgain: 'Try again',
    backToHome: 'Back to home',
    supportTitle: 'What you can do now',
    supportText:
      'Retry the action. If the problem remains, return to the homepage and open the page again from there.',
  },
  pfl: {
    eyebrow: 'Unerwardeter Fehler',
    generic: 'Ebbes is schiefgonge!',
    description:
      'Die Ansicht hot net sauber gelaade odder verarweit werde kenne. Du kannscht es direkt noch emol probiere.',
    tryAgain: "Probier's nochemol",
    backToHome: 'Zrick zur Schtardtseid',
    supportTitle: 'Was de jetz mache kannscht',
    supportText:
      'Probier die Aktion noch emol. Wenns weider schiefgeht, geh zrick uff die Schtardtseid un ruf die Seid vun do nei uff.',
  },
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams<{ locale?: string }>();
  const locale = (params?.locale as SupportedLocale | undefined) ?? 'de';
  const copy = errorCopy[locale] ?? errorCopy.de;

  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  const homeHref = locale === 'de' ? '/' : `/${locale}`;
  const detailMessage =
    process.env.NODE_ENV === 'production' ? undefined : error.message;

  return (
    <StatusPageFrame
      eyebrow={copy.eyebrow}
      title={copy.generic}
      description={copy.description}
      statusLabel="Status"
      statusValue="Fehler beim Laden"
      actions={[
        { label: copy.tryAgain, onClick: reset, variant: 'solid' },
        { label: copy.backToHome, href: homeHref, variant: 'outline' },
      ]}
      asideEyebrow="Fehlerbehandlung"
      asideTitle={copy.supportTitle}
      asideDescription={copy.supportText}
      asideBody={
        detailMessage ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-4 text-sm text-red-100">
            {detailMessage}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-stone-200">
            {locale === 'en'
              ? 'The technical error details stay hidden in production.'
              : locale === 'pfl'
                ? 'Die technische Fehlerdetails bleiwe im Produktivbetrieb verberschd.'
                : 'Die technischen Fehlerdetails bleiben im Produktivbetrieb ausgeblendet.'}
          </div>
        )
      }
    />
  );
}
