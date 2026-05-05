import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Loading() {
  return (
    <div
      className="surface-page flex min-h-screen items-center justify-center px-4"
      role="status"
      aria-live="polite"
      aria-label="Inhalt lädt"
    >
      <div className="bg-white/92 dark:bg-stone-900/88 flex items-center gap-3 rounded-full border border-stone-300/85 px-5 py-3 shadow-[0_14px_32px_rgba(28,25,23,0.08)] dark:border-stone-700/80 dark:shadow-[0_16px_34px_rgba(0,0,0,0.26)]">
        <LoadingSpinner
          size="md"
          className="border-stone-400 border-t-amber-500 dark:border-stone-600 dark:border-t-amber-300"
        />
        <p className="text-sm font-medium text-stone-800 dark:text-stone-100">
          Inhalt lädt...
        </p>
      </div>
    </div>
  );
}
