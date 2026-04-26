'use client';

import { useEffect } from 'react';
import { StatusPageFrame } from '@/components/ui/StatusPageFrame';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  const detailMessage =
    process.env.NODE_ENV === 'production' ? undefined : error.message;

  return (
    <html>
      <body>
        <StatusPageFrame
          eyebrow="Kritischer Fehler"
          title="Die Anwendung konnte diese Ansicht nicht stabil ausführen"
          description="Es ist ein Fehler aufgetreten, der nicht auf einen einzelnen Bereich begrenzt war. Du kannst den Vorgang erneut starten oder zur Startseite zurückkehren."
          statusLabel="Status"
          statusValue="Globaler Fehler"
          actions={[
            { label: 'Erneut versuchen', onClick: reset, variant: 'solid' },
            { label: 'Zur Startseite', href: '/', variant: 'outline' },
          ]}
          asideEyebrow="Stabilisierung"
          asideTitle="Nächster sinnvoller Schritt"
          asideDescription="Versuche zuerst einen erneuten Aufruf. Wenn der Fehler bestehen bleibt, starte über die Startseite neu und prüfe, ob der Fehler reproduzierbar ist."
          asideBody={
            detailMessage ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-4 text-sm text-red-100">
                {detailMessage}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-stone-200">
                Technische Fehlerdetails bleiben im Produktivbetrieb
                ausgeblendet.
              </div>
            )
          }
        />
      </body>
    </html>
  );
}
