'use client';

import Link from 'next/link';

interface SubmissionPrintActionsProps {
  backHref: string;
  jsonDownloadHref: string;
}

export function SubmissionPrintActions({
  backHref,
  jsonDownloadHref,
}: SubmissionPrintActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-5 dark:border-stone-800 print:hidden">
      <Link
        href={backHref}
        className="inline-flex items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
      >
        Zurück zur Einreichung
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={jsonDownloadHref}
          className="inline-flex items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-100 dark:hover:text-stone-50"
        >
          JSON exportieren
        </a>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
        >
          Drucken
        </button>
      </div>
    </div>
  );
}
