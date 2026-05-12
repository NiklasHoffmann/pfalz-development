import Image from 'next/image';
import type { MobileNavItem } from './types';

interface HomeMobileDockProps {
  items: MobileNavItem[];
  ariaLabel?: string;
  currentPathname?: string;
  currentHash?: string;
  activeHrefOverride?: string;
}

function normalizeDockTarget(href: string): { pathname: string; hash: string } {
  const [rawPathname, rawHash = ''] = href.split('#');
  const pathname = !rawPathname || rawPathname === '/' ? '/' : rawPathname;

  return {
    pathname:
      pathname.endsWith('/') && pathname !== '/'
        ? pathname.slice(0, -1)
        : pathname,
    hash: rawHash ? `#${rawHash}` : '',
  };
}

export function HomeMobileDock({
  items,
  ariaLabel = 'Mobile navigation',
  currentPathname = '/',
  currentHash = '',
  activeHrefOverride,
}: HomeMobileDockProps) {
  const normalizedItems = items.map((item) => ({
    item,
    target: normalizeDockTarget(item.href),
  }));

  const activeHashHref = currentHash
    ? normalizedItems.find(
        ({ target }) =>
          target.hash &&
          currentPathname === target.pathname &&
          currentHash === target.hash
      )?.item.href
    : undefined;

  return (
    <div
      data-mobile-dock="true"
      className="fixed inset-x-0 bottom-0 z-40 px-2 pb-[calc(env(safe-area-inset-bottom)+0.7rem)] md:hidden"
    >
      <nav
        className="surface-mobile-dock mx-auto w-full max-w-md overflow-hidden rounded-[1.9rem] border border-stone-300/80 p-2 backdrop-blur-xl dark:border-stone-600/90"
        aria-label={ariaLabel}
      >
        <div className="grid grid-cols-4 gap-2">
          {normalizedItems.map(({ item, target }) => {
            const isWhatsApp =
              item.variant === 'whatsapp' ||
              item.href.startsWith('https://wa.me/');
            const isActive = activeHrefOverride
              ? item.href === activeHrefOverride
              : activeHashHref
                ? item.href === activeHashHref
                : target.hash
                  ? currentPathname === target.pathname &&
                    currentHash === target.hash
                  : currentPathname === target.pathname;

            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex min-h-14 flex-col items-center justify-center rounded-[1.1rem] border px-2 py-2 text-center transition ${
                  isWhatsApp
                    ? `relative border-emerald-500/55 bg-[linear-gradient(180deg,rgba(240,253,244,0.98),rgba(236,253,245,0.9))] focus-visible:border-emerald-700 focus-visible:outline-none dark:border-emerald-300/40 dark:bg-[linear-gradient(180deg,rgba(8,47,35,0.72),rgba(6,78,59,0.62))] ${
                        isActive
                          ? 'border-emerald-500/85 bg-[linear-gradient(180deg,rgba(220,252,231,1),rgba(209,250,229,0.95))] shadow-[0_8px_20px_rgba(5,150,105,0.14)] dark:border-emerald-300/65 dark:bg-[linear-gradient(180deg,rgba(6,78,59,0.82),rgba(6,95,70,0.72))]'
                          : 'hover:border-emerald-500/75 hover:bg-[linear-gradient(180deg,rgba(236,253,245,1),rgba(220,252,231,0.94))] dark:hover:border-emerald-300/55 dark:hover:bg-[linear-gradient(180deg,rgba(8,47,35,0.78),rgba(6,78,59,0.68))]'
                      }`
                    : `${
                        isActive
                          ? 'border-amber-300 bg-white/90 shadow-sm dark:border-amber-300/70 dark:bg-stone-800/90'
                          : 'border-transparent hover:border-stone-200 hover:bg-white/80 dark:hover:border-stone-700/80 dark:hover:bg-stone-800/90'
                      } focus-visible:border-amber-500 focus-visible:bg-white dark:focus-visible:border-amber-300 dark:focus-visible:bg-stone-800`
                }`}
              >
                {isWhatsApp ? (
                  <>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(180deg,#25D366,#16A34A)] text-white shadow-[0_8px_18px_rgba(5,150,105,0.2)] ring-1 ring-white/55 dark:ring-white/10">
                      <Image
                        src="/icons/whatsapp.svg"
                        alt="WhatsApp"
                        width={20}
                        height={20}
                        className="h-5 w-5"
                      />
                    </span>
                  </>
                ) : (
                  <span
                    className={`mb-1 h-1.5 w-6 rounded-full transition ${
                      isActive
                        ? 'bg-amber-500 dark:bg-amber-300'
                        : 'bg-stone-300 group-hover:bg-amber-400 dark:bg-stone-500/90 dark:group-hover:bg-amber-300'
                    }`}
                  />
                )}
                <span
                  className={`text-xs font-semibold leading-tight ${
                    isWhatsApp
                      ? 'sr-only'
                      : isActive
                        ? 'text-stone-950 dark:text-stone-50'
                        : 'text-stone-800 dark:text-stone-50'
                  }`}
                >
                  {item.shortLabel}
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
