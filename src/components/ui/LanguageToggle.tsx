'use client';

import { useEffect, useLayoutEffect, useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { routing, usePathname, useRouter } from '@/routing';

type SupportedLocale = (typeof routing.locales)[number];
const LOCALE_SCROLL_RESTORE_KEY = 'locale-switch-scroll-restore';

function FlagSwatch({ locale }: { locale: SupportedLocale }) {
  const iconByLocale: Record<SupportedLocale, string> = {
    de: '/icons/germany.svg',
    en: '/icons/united-kingdom.svg',
    pfl: '/icons/dubbeglas.svg',
  };

  return (
    <span
      className={`inline-flex h-4 w-6 shrink-0 overflow-hidden rounded-[0.4rem] border border-black/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] ${
        locale === 'pfl' ? 'bg-white' : ''
      }`}
    >
      <Image
        src={iconByLocale[locale]}
        alt=""
        width={24}
        height={16}
        aria-hidden="true"
        className="h-full w-full object-cover"
      />
    </span>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={`h-3.5 w-3.5 text-stone-600 transition-transform dark:text-stone-300 ${open ? 'rotate-180' : ''}`}
    >
      <path
        d="M4 6.25L8 10.25L12 6.25"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LanguageToggle() {
  const locale = useLocale() as SupportedLocale;
  const t = useTranslations('language');
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [optimisticLocale, setOptimisticLocale] =
    useState<SupportedLocale>(locale);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const raw = sessionStorage.getItem(LOCALE_SCROLL_RESTORE_KEY);
    if (!raw) {
      return;
    }

    sessionStorage.removeItem(LOCALE_SCROLL_RESTORE_KEY);

    let restoreData: { y?: number } | null = null;
    try {
      restoreData = JSON.parse(raw) as { y?: number };
    } catch {
      return;
    }

    if (typeof restoreData?.y !== 'number') {
      return;
    }

    const targetY = Math.max(0, restoreData.y);
    let attempts = 0;
    const maxAttempts = 6;

    const restore = () => {
      window.scrollTo({ top: targetY, behavior: 'auto' });
      attempts += 1;

      if (Math.abs(window.scrollY - targetY) < 2 || attempts >= maxAttempts) {
        return;
      }

      requestAnimationFrame(restore);
    };

    requestAnimationFrame(() => requestAnimationFrame(restore));
  }, [locale]);

  useEffect(() => {
    setOptimisticLocale(locale);
  }, [locale]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  function handleLocaleChange(nextLocale: SupportedLocale) {
    if (isPending || nextLocale === locale) {
      setIsOpen(false);
      return;
    }

    setOptimisticLocale(nextLocale);
    setIsOpen(false);

    sessionStorage.setItem(
      LOCALE_SCROLL_RESTORE_KEY,
      JSON.stringify({ y: window.scrollY })
    );

    startTransition(() => {
      router.replace(pathname, { locale: nextLocale, scroll: false });
    });
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => {
          if (isPending) {
            return;
          }
          setIsOpen((current) => !current);
        }}
        className={`inline-flex h-8 min-w-0 items-center justify-between gap-2 rounded-full border border-stone-400/80 bg-stone-50 px-2.5 text-[11px] font-semibold text-stone-900 shadow-sm backdrop-blur transition hover:bg-white focus:border-amber-600 focus:outline-none dark:border-stone-600/90 dark:bg-stone-800 dark:text-stone-50 dark:hover:bg-stone-700 sm:h-10 sm:min-w-[9.25rem] sm:gap-3 sm:px-3.5 sm:text-sm ${isPending ? 'cursor-wait' : ''}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={t('toggle')}
        aria-busy={isPending}
      >
        <span className="flex items-center gap-2">
          <FlagSwatch locale={optimisticLocale} />
          <span className="hidden sm:inline">{t(optimisticLocale)}</span>
        </span>
        <ChevronIcon open={isOpen} />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+0.55rem)] z-50 min-w-[10.5rem] overflow-hidden rounded-[1.25rem] border border-stone-200 bg-white p-1.5 shadow-[0_24px_60px_rgba(28,25,23,0.16)] backdrop-blur-xl dark:border-stone-600/90 dark:bg-stone-800 sm:min-w-full">
          <div className="space-y-1" role="menu" aria-label={t('toggle')}>
            {routing.locales.map((supportedLocale) => {
              const isActive = supportedLocale === optimisticLocale;

              return (
                <button
                  key={supportedLocale}
                  type="button"
                  onClick={() => handleLocaleChange(supportedLocale)}
                  className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm transition ${
                    isActive
                      ? 'bg-stone-950 text-stone-50 dark:bg-amber-300 dark:text-stone-950'
                      : 'text-stone-800 hover:bg-stone-100 dark:text-stone-50 dark:hover:bg-stone-700'
                  }`}
                  role="menuitemradio"
                  aria-checked={isActive}
                >
                  <span className="flex items-center gap-2.5">
                    <FlagSwatch locale={supportedLocale} />
                    <span>{t(supportedLocale)}</span>
                  </span>
                  <span
                    className={`text-xs ${isActive ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                      className="h-4 w-4"
                    >
                      <path
                        d="M3.5 8.25L6.5 11.25L12.5 5.25"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Preload icons to avoid visual flash when switching locales */}
      <div className="hidden" aria-hidden="true">
        <Image src="/icons/germany.svg" alt="" width={24} height={16} priority />
        <Image
          src="/icons/united-kingdom.svg"
          alt=""
          width={24}
          height={16}
          priority
        />
        <Image src="/icons/dubbeglas.svg" alt="" width={24} height={16} priority />
      </div>
    </div>
  );
}
