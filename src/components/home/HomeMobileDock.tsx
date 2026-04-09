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
                className={`group flex min-h-14 flex-col items-center justify-center rounded-[1.1rem] border px-2 py-2 text-center transition focus-visible:border-amber-500 focus-visible:bg-white dark:focus-visible:border-amber-300 dark:focus-visible:bg-stone-800 ${
                  isActive
                    ? 'border-amber-300 bg-white/90 shadow-sm dark:border-amber-300/70 dark:bg-stone-800/90'
                    : 'border-transparent hover:border-stone-200 hover:bg-white/80 dark:hover:border-stone-700/80 dark:hover:bg-stone-800/90'
                }`}
              >
                <span
                  className={`mb-1 h-1.5 w-6 rounded-full transition ${
                    isActive
                      ? 'bg-amber-500 dark:bg-amber-300'
                      : 'bg-stone-300 group-hover:bg-amber-400 dark:bg-stone-500/90 dark:group-hover:bg-amber-300'
                  }`}
                />
                <span
                  className={`text-xs font-semibold leading-tight ${
                    isActive
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
