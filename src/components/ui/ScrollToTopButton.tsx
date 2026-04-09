'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from '@/routing';

const SHOW_AFTER_SCROLL_Y = 280;

const ariaLabels: Record<string, string> = {
  de: 'Nach oben scrollen',
  en: 'Scroll back to top',
  pfl: 'Widder nuff scrolle',
};

const titles: Record<string, string> = {
  de: 'Nach oben',
  en: 'Back to top',
  pfl: 'Widder nuff',
};

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 18V6M12 6L6.75 11.25M12 6L17.25 11.25"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ScrollToTopButton() {
  const locale = useLocale();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const hasMobileDock = pathname === '/';

  useEffect(() => {
    const onScroll = () => {
      setIsVisible(window.scrollY > SHOW_AFTER_SCROLL_Y);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  function handleClick() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const ariaLabel = ariaLabels[locale] ?? ariaLabels.de;
  const title = titles[locale] ?? titles.de;
  const bottomOffsetClass = hasMobileDock
    ? 'bottom-[calc(env(safe-area-inset-bottom)+6.8rem)] sm:bottom-[calc(env(safe-area-inset-bottom)+7.2rem)] md:bottom-6'
    : 'bottom-5 sm:bottom-6';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      title={title}
      className={`bg-white/92 dark:bg-stone-900/88 fixed right-5 z-[80] inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-300/80 text-stone-900 shadow-[0_10px_25px_rgba(28,25,23,0.2)] backdrop-blur-sm transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 dark:border-stone-600/85 dark:text-stone-100 dark:shadow-[0_12px_28px_rgba(0,0,0,0.38)] dark:focus-visible:ring-amber-300 sm:right-6 ${bottomOffsetClass} ${
        isVisible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <ArrowUpIcon />
    </button>
  );
}
