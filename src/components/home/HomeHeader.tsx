import Image from 'next/image';
import { HomeHeaderControls } from './HomeHeaderControls';
import type { NavItem } from './types';

interface HomeHeaderProps {
  appName: string;
  navItems: NavItem[];
}

export function HomeHeader({ appName, navItems }: HomeHeaderProps) {
  return (
    <header
      id="home-header"
      className="surface-header fixed inset-x-0 top-0 z-40 border-b border-stone-300/80 backdrop-blur-xl dark:border-stone-600/90"
    >
      <div className="mx-auto min-h-[50px] max-w-7xl px-4 py-[9px] sm:min-h-[58px] sm:px-6 lg:px-10">
        <div className="flex items-center justify-between gap-2 sm:gap-3 lg:gap-6">
          <a
            href="#start"
            className="inline-flex min-w-0 items-center leading-none"
            aria-label={appName}
          >
            <span className="-mb-[32px] -mt-[8px] inline-grid place-items-center">
              <Image
                src="/pfalz-development-logo-light-ohne-schrift.webp"
                alt={appName}
                width={360}
                height={163}
                sizes="(max-width: 640px) 132px, (max-width: 1024px) 154px, 172px"
                quality={60}
                priority
                className="pointer-events-none col-start-1 row-start-1 h-[3.81rem] w-auto object-contain opacity-100 transition-opacity duration-200 ease-linear dark:opacity-0 sm:h-[4.25rem] lg:h-[4.64rem]"
              />
              <Image
                src="/pfalz-development-logo-dark-ohne-schrift.webp"
                alt={appName}
                width={360}
                height={163}
                sizes="(max-width: 640px) 132px, (max-width: 1024px) 154px, 172px"
                quality={60}
                className="pointer-events-none col-start-1 row-start-1 h-[3.81rem] w-auto object-contain opacity-0 transition-opacity duration-200 ease-linear dark:opacity-100 sm:h-[4.25rem] lg:h-[4.64rem]"
              />
            </span>
          </a>

          <nav
            className="hidden items-center gap-5 md:flex lg:gap-6"
            aria-label={`${appName} Hauptnavigation`}
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-md px-1.5 py-1 text-sm font-medium text-stone-700 transition hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 dark:text-stone-200 dark:hover:text-white dark:focus-visible:ring-amber-300"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <HomeHeaderControls />
        </div>
      </div>
    </header>
  );
}
