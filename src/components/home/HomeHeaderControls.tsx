'use client';

import type { HomePageData } from './types';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface HomeHeaderControlsProps {
  controls: HomePageData['controls'];
}

export function HomeHeaderControls({ controls }: HomeHeaderControlsProps) {
  return (
    <div className="shrink-0">
      <div className="flex items-center justify-end gap-1.5 sm:gap-2">
        <LanguageToggle
          currentLocale={controls.currentLocale}
          labels={controls.language}
        />
        <ThemeToggle labels={controls.theme} />
      </div>
    </div>
  );
}
