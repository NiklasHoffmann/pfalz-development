'use client';

import { useEffect, useMemo, useState } from 'react';

type SectionSpyNavItem = {
  href: string;
  label: string;
};

type SectionSpyNavProps = {
  title: string;
  items: SectionSpyNavItem[];
  className?: string;
};

function getSectionId(href: string): string {
  return href.startsWith('#') ? href.slice(1) : href;
}

export function SectionSpyNav({ title, items, className }: SectionSpyNavProps) {
  const sectionIds = useMemo(
    () => items.map((item) => getSectionId(item.href)),
    [items]
  );
  const [activeId, setActiveId] = useState(sectionIds[0] ?? '');

  useEffect(() => {
    if (!sectionIds.length) {
      return;
    }

    const updateActiveSection = () => {
      const y = window.scrollY;
      const docBottom =
        window.innerHeight + y >= document.documentElement.scrollHeight - 8;
      const viewportHeight = window.innerHeight;
      const midLine = viewportHeight * 0.5;

      if (docBottom) {
        setActiveId(sectionIds[sectionIds.length - 1]);
        return;
      }

      const hashId = window.location.hash.slice(1);
      if (hashId && sectionIds.includes(hashId)) {
        const hashSection = document.getElementById(hashId);
        if (hashSection) {
          const top = hashSection.getBoundingClientRect().top;
          const bottom = hashSection.getBoundingClientRect().bottom;
          const withinTargetWindow = top <= midLine && bottom >= midLine;

          // Keep clicked hash active while it intersects the viewport middle line.
          if (withinTargetWindow) {
            setActiveId(hashId);
            return;
          }
        }
      }

      let nextActive = sectionIds[0];
      let bestDistance = Number.POSITIVE_INFINITY;

      for (const id of sectionIds) {
        const section = document.getElementById(id);
        if (!section) {
          continue;
        }

        const rect = section.getBoundingClientRect();
        const center = rect.top + rect.height / 2;

        if (rect.top <= midLine && rect.bottom >= midLine) {
          setActiveId(id);
          return;
        }

        const distance = Math.abs(center - midLine);
        if (distance < bestDistance) {
          bestDistance = distance;
          nextActive = id;
        }
      }

      setActiveId(nextActive);
    };

    const handleHashChange = () => {
      const hashId = window.location.hash.slice(1);
      if (!hashId || !sectionIds.includes(hashId)) {
        return;
      }

      setActiveId(hashId);
      requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [sectionIds]);

  return (
    <nav className={className}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-900 dark:text-amber-200">
        {title}
      </p>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => {
          const id = getSectionId(item.href);
          const isActive = id === activeId;

          return (
            <li key={item.href}>
              <a
                href={item.href}
                aria-current={isActive ? 'location' : undefined}
                onClick={() => {
                  setActiveId(id);
                }}
                className={`group flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                  isActive
                    ? 'border-stone-400/70 bg-stone-100/95 font-semibold text-stone-900 shadow-[0_6px_14px_rgba(41,37,36,0.12)] dark:border-stone-500 dark:bg-stone-800/75 dark:text-stone-50 dark:shadow-none'
                    : 'border-transparent text-stone-700 hover:border-stone-300/70 hover:bg-white/75 hover:text-stone-900 dark:text-stone-200 dark:hover:border-stone-600 dark:hover:bg-stone-800/45 dark:hover:text-stone-50'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 rounded-full transition ${
                    isActive
                      ? 'bg-stone-700 dark:bg-stone-100'
                      : 'bg-transparent group-hover:bg-stone-500/65 dark:group-hover:bg-stone-300/65'
                  }`}
                />
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
