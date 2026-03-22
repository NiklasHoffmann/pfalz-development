'use client';

import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function HomeHeaderControls() {
  return (
    <div className="shrink-0">
      <div className="flex items-center justify-end gap-1.5 sm:gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </div>
  );
}
