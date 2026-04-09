'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { SupportedLocale } from '@/components/home/types';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';

const errorCopy: Record<
  SupportedLocale,
  { generic: string; tryAgain: string }
> = {
  de: {
    generic: 'Etwas ist schief gelaufen!',
    tryAgain: 'Erneut versuchen',
  },
  en: {
    generic: 'Something went wrong!',
    tryAgain: 'Try again',
  },
  pfl: {
    generic: 'Ebbes is schiefgonge!',
    tryAgain: "Probier's nochemol",
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
    // Log the error to an error reporting service
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <ErrorDisplay
        title={copy.generic}
        message={error.message}
        onRetry={reset}
        retryLabel={copy.tryAgain}
      />
    </div>
  );
}
