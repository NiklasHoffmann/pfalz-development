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
    // Keep only a tiny defer so controls appear quickly for users.
    const timer = window.setTimeout(() => setEnabled(true), 250);

    const enableNow = () => setEnabled(true);

    window.addEventListener('pointerdown', enableNow, { once: true });
    window.addEventListener('keydown', enableNow, { once: true });
    window.addEventListener('touchstart', enableNow, { once: true });
    window.addEventListener('scroll', enableNow, { once: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', enableNow);
      window.removeEventListener('keydown', enableNow);
      window.removeEventListener('touchstart', enableNow);
      window.removeEventListener('scroll', enableNow);
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
