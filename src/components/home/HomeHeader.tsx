import Image from 'next/image';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import type { NavItem } from './types';

interface HomeHeaderProps {
  appName: string;
  navItems: NavItem[];
}

export function HomeHeader({ appName, navItems }: HomeHeaderProps) {
  return (
    <div className="fixed inset-x-0 top-0 z-40 border-b border-stone-300/80 bg-[linear-gradient(180deg,_rgba(252,250,246,0.96),_rgba(248,244,236,0.92))] shadow-[0_10px_35px_rgba(41,37,36,0.08)] backdrop-blur-xl dark:border-stone-600/90 dark:bg-[linear-gradient(180deg,_rgba(68,57,49,0.96),_rgba(42,55,69,0.9))] dark:shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
      <div className="mx-auto max-w-7xl px-[40px] py-[5px]">
        <div className="flex items-center justify-between gap-2 sm:gap-3 lg:gap-6">
          <a
            href="#start"
            className="inline-flex min-w-0 items-center"
            aria-label={appName}
          >
            <Image
              src="/pfalz-development-logo-light.png"
              alt={appName}
              width={1536}
              height={1024}
              sizes="(max-width: 640px) 132px, (max-width: 1024px) 154px, 172px"
              priority
              className="h-[3rem] w-auto object-contain dark:hidden sm:h-[3.35rem] lg:h-[3.65rem]"
            />
            <Image
              src="/pfalz-development-logo-dark.png"
              alt={appName}
              width={1536}
              height={1024}
              sizes="(max-width: 640px) 132px, (max-width: 1024px) 154px, 172px"
              priority
              className="hidden h-[3rem] w-auto object-contain dark:block sm:h-[3.35rem] lg:h-[3.65rem]"
            />
          </a>

          <nav className="hidden items-center gap-5 md:flex lg:gap-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-stone-700 transition hover:text-stone-950 dark:text-stone-200 dark:hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
