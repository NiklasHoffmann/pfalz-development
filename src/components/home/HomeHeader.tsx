'use client';

import Image from 'next/image';
import { HomeHeaderControls } from './HomeHeaderControls';
import type { HomePageData, NavItem } from './types';

interface HomeHeaderProps {
  appName: string;
  navItems: NavItem[];
  brandHref?: string;
  activeHref?: string;
  navAriaLabel?: string;
  controls: HomePageData['controls'];
}

export function HomeHeader({
  appName,
  navItems,
  brandHref = '#start',
  activeHref,
  navAriaLabel = `${appName} navigation`,
  controls,
}: HomeHeaderProps) {
  return (
    <header
      id="home-header"
      className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-3 h-[7rem] bg-transparent backdrop-blur-md [-webkit-mask-image:linear-gradient(to_bottom,black_0%,rgba(0,0,0,0.58)_24%,rgba(0,0,0,0.22)_52%,transparent_100%)] [mask-image:linear-gradient(to_bottom,black_0%,rgba(0,0,0,0.58)_24%,rgba(0,0,0,0.22)_52%,transparent_100%)] sm:-top-4 sm:h-32"
      />

      <div>
        <div className="surface-header relative mx-auto min-h-[50px] max-w-7xl rounded-full border border-stone-300/80 px-4 py-[9px] shadow-[0_10px_34px_rgba(28,25,23,0.08)] backdrop-blur-xl dark:border-stone-600/90 sm:min-h-[58px] sm:px-6 lg:px-10">
          <div className="flex items-center justify-between gap-2 sm:gap-3 lg:gap-6">
            <a
              href={brandHref}
              className="inline-flex min-w-0 items-center leading-none"
              aria-label={appName}
            >
              <span className="-mb-[32px] -mt-[8px] inline-grid place-items-center">
                <Image
                  src="/pfalz-development-logo-light-ohne-schrift.webp"
                  alt={appName}
                  width={360}
                  height={163}
                  sizes="(max-width: 640px) 136px, (max-width: 1024px) 148px, 160px"
                  quality={24}
                  priority
                  fetchPriority="high"
                  className="pointer-events-none h-[3.81rem] w-auto object-contain dark:hidden sm:h-[4.25rem] lg:h-[4.64rem]"
                />
                <Image
                  src="/pfalz-development-logo-dark-ohne-schrift.webp"
                  alt={appName}
                  width={360}
                  height={163}
                  sizes="(max-width: 640px) 136px, (max-width: 1024px) 148px, 160px"
                  quality={24}
                  priority
                  fetchPriority="high"
                  className="pointer-events-none hidden h-[3.81rem] w-auto object-contain dark:block sm:h-[4.25rem] lg:h-[4.64rem]"
                />
              </span>
            </a>

            <nav
              className="hidden items-center gap-5 md:flex lg:gap-6"
              aria-label={navAriaLabel}
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-1.5 py-1 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 dark:focus-visible:ring-amber-300 ${
                    activeHref === item.href
                      ? 'text-amber-800 dark:text-amber-200'
                      : 'text-stone-700 hover:text-stone-950 dark:text-stone-200 dark:hover:text-white'
                  }`}
                  aria-current={activeHref === item.href ? 'page' : undefined}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <HomeHeaderControls controls={controls} />
          </div>
        </div>
      </div>
    </header>
  );
}
