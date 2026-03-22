'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';

type ThemeMode = 'light' | 'dark' | 'system';

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
  const { theme, resolvedTheme, setTheme } = useTheme();
  const t = useTranslations('theme');

  const effectiveTheme: Exclude<ThemeMode, 'system'> =
    mounted &&
    (theme === 'dark' || (theme === 'system' && resolvedTheme === 'dark'))
      ? 'dark'
      : 'light';

  const options = [
    { mode: 'light' as const, label: t('light'), icon: <SunIcon /> },
    { mode: 'dark' as const, label: t('dark'), icon: <MoonIcon /> },
  ];

  const isDark = effectiveTheme === 'dark';
  const nextTheme: 'light' | 'dark' = isDark ? 'light' : 'dark';

  function handleThemeToggle() {
    if (!mounted) {
      return;
    }

    const withViewTransition = document as Document & {
      startViewTransition?: (updateCallback: () => void) => void;
    };

    if (typeof withViewTransition.startViewTransition === 'function') {
      withViewTransition.startViewTransition(() => {
        setTheme(nextTheme);
      });
      return;
    }

    setTheme(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={handleThemeToggle}
      aria-label={`${t('toggle')} (${t(effectiveTheme)})`}
      aria-pressed={isDark}
      disabled={!mounted}
      aria-disabled={!mounted}
      className="relative inline-flex h-8 w-14 items-center overflow-hidden rounded-full border border-stone-400/80 bg-[linear-gradient(180deg,rgba(241,235,226,0.95),rgba(232,225,214,0.95))] p-1 text-stone-900 shadow-[inset_0_2px_3px_rgba(28,25,23,0.2),inset_0_-1px_2px_rgba(255,255,255,0.45),0_1px_3px_rgba(28,25,23,0.08)] backdrop-blur transition-[background-color,border-color,color] duration-[260ms] ease-linear dark:border-stone-600/90 dark:bg-[linear-gradient(180deg,rgba(49,43,40,0.94),rgba(39,35,32,0.94))] dark:text-stone-50 dark:shadow-[inset_0_2px_3px_rgba(0,0,0,0.55),inset_0_-1px_2px_rgba(255,255,255,0.05),0_1px_3px_rgba(0,0,0,0.22)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 dark:focus-visible:ring-amber-300 sm:h-10 sm:w-[4.5rem]"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[2px] rounded-full shadow-[inset_0_2px_4px_rgba(28,25,23,0.16),inset_0_1px_0_rgba(255,255,255,0.3)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]"
      />

      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-1 my-auto z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-stone-900 text-stone-50 shadow-[0_1px_2px_rgba(28,25,23,0.4)] transition-[transform,background-color,box-shadow] duration-200 ease-linear dark:bg-amber-300 dark:text-stone-950 dark:shadow-[0_1px_2px_rgba(0,0,0,0.35)] sm:h-8 sm:w-8 ${
          isDark ? 'translate-x-6 sm:translate-x-8' : 'translate-x-0'
        }`}
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </span>

      <span className="relative z-0 grid w-full grid-cols-2 place-items-center">
        {options.map((option) => {
          const isActive = option.mode === effectiveTheme;

          return (
            <span
              key={option.mode}
              aria-hidden="true"
              className={`inline-flex items-center justify-center ${
                isActive
                  ? 'text-transparent'
                  : 'text-stone-700/85 dark:text-stone-200/90'
              }`}
            >
              {option.icon}
            </span>
          );
        })}
      </span>
    </button>
  );
}
