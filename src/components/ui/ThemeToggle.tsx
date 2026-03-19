'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
      <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M10 1.75V4.25M10 15.75V18.25M18.25 10H15.75M4.25 10H1.75M15.83 4.17L14.06 5.94M5.94 14.06L4.17 15.83M15.83 15.83L14.06 14.06M5.94 5.94L4.17 4.17"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="M10 2.85C6.05 2.85 2.85 6.05 2.85 10C2.85 13.95 6.05 17.15 10 17.15C12.76 17.15 15.16 15.58 16.35 13.28C15.82 13.45 15.25 13.55 14.65 13.55C11.57 13.55 9.07 11.05 9.07 7.97C9.07 6.08 10.01 4.41 11.45 3.4C10.98 3.03 10.5 2.85 10 2.85Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ThemeToggle() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations('theme');
  const nextThemeLabel =
    mounted && resolvedTheme === 'dark' ? t('light') : t('dark');
  const nextThemeIcon =
    mounted && resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />;

  return (
    <button
      type="button"
      onClick={() => {
        if (!mounted) {
          return;
        }
        const root = document.documentElement;
        root.classList.add('theme-transition');
        window.requestAnimationFrame(() => {
          const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
          setTheme(nextTheme);
        });
        window.setTimeout(() => {
          root.classList.remove('theme-transition');
        }, 320);
      }}
      className="inline-flex h-8 w-auto min-w-[2.75rem] items-center justify-center rounded-full border border-stone-400/80 bg-stone-50/95 px-2 text-[11px] font-semibold text-stone-900 shadow-sm backdrop-blur transition-[background-color,border-color,color,fill,stroke] duration-[260ms] ease-linear hover:bg-white focus:border-amber-600 focus:outline-none disabled:cursor-wait disabled:opacity-70 dark:border-stone-600/90 dark:bg-stone-800/90 dark:text-stone-50 dark:hover:bg-stone-700 sm:h-10 sm:min-w-[5.75rem] sm:px-4 sm:text-sm"
      aria-label={t('toggle')}
      disabled={!mounted}
      aria-disabled={!mounted}
    >
      <span className="inline-flex items-center justify-center sm:mr-2">
        {nextThemeIcon}
      </span>
      <span className="hidden sm:inline">{nextThemeLabel}</span>
    </button>
  );
}
