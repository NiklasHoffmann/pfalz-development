'use client';

import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function HomeHeaderControls() {
  return (
    <div className="w-[4.375rem] shrink-0 sm:w-[15.5rem]">
      <div className="flex items-center justify-end gap-1.5 sm:gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </div>
  );
}
