import { StatusPageFrame } from '@/components/ui/StatusPageFrame';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Loading() {
  return (
    <StatusPageFrame
      eyebrow="Bitte kurz warten"
      title="Inhalt wird vorbereitet"
      description="Die Seite wird gerade geladen und aufgebaut. Das dauert in der Regel nur einen kurzen Moment."
      statusLabel="Status"
      statusValue="Inhalt lädt"
      asideEyebrow="Live-Aufbau"
      asideTitle="Die Seite ist gleich da"
      asideDescription="Daten, Inhalte und Oberfläche werden gerade zusammengesetzt, damit du direkt in der finalen Ansicht landest."
      asideBody={
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
          <LoadingSpinner
            size="lg"
            className="border-stone-500 border-t-amber-300"
          />
          <div>
            <p className="text-sm font-medium text-white">Wird geladen</p>
            <p className="mt-1 text-sm text-stone-300">
              Bitte die Seite nicht neu laden.
            </p>
          </div>
        </div>
      }
    />
  );
}
