import type { MobileNavItem } from './types';

interface HomeMobileDockProps {
  items: MobileNavItem[];
}

export function HomeMobileDock({ items }: HomeMobileDockProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-2 pb-[calc(env(safe-area-inset-bottom)+0.7rem)] md:hidden">
      <nav className="mx-auto w-full max-w-md overflow-hidden rounded-[1.9rem] border border-stone-300/80 bg-[linear-gradient(180deg,_rgba(252,250,246,0.985),_rgba(247,241,231,0.96))] p-2 shadow-[0_-10px_35px_rgba(41,37,36,0.14)] backdrop-blur-xl dark:border-stone-600/90 dark:bg-[linear-gradient(180deg,_rgba(66,56,49,0.96),_rgba(39,53,68,0.96))] dark:shadow-[0_-10px_35px_rgba(0,0,0,0.3)]">
        <div className="grid grid-cols-4 gap-2">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group flex min-h-14 flex-col items-center justify-center rounded-[1.1rem] border border-transparent px-2 py-2 text-center transition hover:border-stone-200 hover:bg-white/80 dark:hover:border-stone-700/80 dark:hover:bg-stone-800/90"
            >
              <span className="mb-1 h-1.5 w-6 rounded-full bg-stone-300 transition group-hover:bg-amber-400 dark:bg-stone-500/90 dark:group-hover:bg-amber-300" />
              <span className="text-xs font-semibold leading-tight text-stone-800 dark:text-stone-50">
                {item.shortLabel}
              </span>
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}
