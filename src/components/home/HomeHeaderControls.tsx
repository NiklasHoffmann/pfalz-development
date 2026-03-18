'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const LanguageToggle = dynamic(
  () =>
    import('@/components/ui/LanguageToggle').then(
      (module) => module.LanguageToggle
    ),
  { ssr: false }
);

const ThemeToggle = dynamic(
  () =>
    import('@/components/ui/ThemeToggle').then((module) => module.ThemeToggle),
  { ssr: false }
);

export function HomeHeaderControls() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (enabled) return;

    const enable = () => setEnabled(true);

    window.addEventListener('pointerdown', enable, { once: true });
    window.addEventListener('keydown', enable, { once: true });
    window.addEventListener('touchstart', enable, { once: true });
    window.addEventListener('scroll', enable, { once: true });

    return () => {
      window.removeEventListener('pointerdown', enable);
      window.removeEventListener('keydown', enable);
      window.removeEventListener('touchstart', enable);
      window.removeEventListener('scroll', enable);
    };
  }, []);

  if (!enabled) {
    return (
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <div className="h-8 w-8 animate-pulse rounded-full border border-stone-300/80 bg-stone-100 dark:border-stone-600/90 dark:bg-stone-700 sm:h-10 sm:w-10" />
        <div className="hidden h-8 w-8 animate-pulse rounded-full border border-stone-300/80 bg-stone-100 dark:border-stone-600/90 dark:bg-stone-700 sm:block sm:h-10 sm:w-10" />
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
      <LanguageToggle />
      <ThemeToggle />
    </div>
  );
}
