import { HomeFooter } from '@/components/home/HomeFooter';
import { HomeHeader } from '@/components/home/HomeHeader';
import type { NavItem } from '@/components/home/types';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';
import type { SeoPageContent } from '@/content/seo/types';
import { siteConfig } from '@/config/site';
import { getHeaderControlsCopy } from '@/lib/locale-ui';
import { getTranslations } from 'next-intl/server';

interface SeoLandingPageProps {
  content: SeoPageContent;
  locale?: string;
  activeNav?: 'home' | 'service' | 'industry' | 'contact';
}

function getIndustryNavLabel(locale: string): string {
  if (locale === 'en') return 'Industry';
  if (locale === 'pfl') return 'Branche';
  return 'Branche';
}

function getMoreLabel(locale: string): string {
  if (locale === 'en') return 'Read more';
  if (locale === 'pfl') return 'Mehr lese';
  return 'Mehr lesen';
}

function getLessLabel(locale: string): string {
  if (locale === 'en') return 'Show less';
  if (locale === 'pfl') return 'Wenischer zeige';
  return 'Weniger anzeigen';
}

function getPrimaryNavigationLabel(locale: string, appName: string): string {
  if (locale === 'en') return `${appName} primary navigation`;
  return `${appName} Hauptnavigation`;
}

function localizeHref(href: string, locale: string): string {
  if (!href.startsWith('/')) {
    return href;
  }

  if (locale === 'de') {
    return href;
  }

  return href === '/' ? `/${locale}` : `/${locale}${href}`;
}

export async function SeoLandingPage({
  content,
  locale = 'de',
  activeNav,
}: SeoLandingPageProps) {
  const navT = await getTranslations({ locale, namespace: 'navigation' });
  const legalT = await getTranslations({ locale, namespace: 'legal' });
  const industryLabel = getIndustryNavLabel(locale);
  const moreLabel = getMoreLabel(locale);
  const lessLabel = getLessLabel(locale);
  const primaryNavigationLabel = getPrimaryNavigationLabel(
    locale,
    siteConfig.name
  );
  const basePath = locale === 'de' ? '' : `/${locale}`;
  const homeHref = basePath || '/';
  const homeLinkHref = '/';
  const localizedHomeLinkHref = localizeHref(homeLinkHref, locale);
  const navItems: NavItem[] = [
    { label: navT('home'), href: homeHref },
    { label: navT('about'), href: `${basePath}/leistungen` },
    {
      label: industryLabel,
      href: `${basePath}/branchen`,
    },
    { label: navT('contact'), href: `${homeHref}#kontakt` },
  ];

  let activeHref: string | undefined;
  if (activeNav === 'home') activeHref = homeHref;
  if (activeNav === 'service') activeHref = `${basePath}/leistungen`;
  if (activeNav === 'industry') {
    activeHref = `${basePath}/branchen`;
  }
  if (activeNav === 'contact') activeHref = `${homeHref}#kontakt`;

  return (
    <div className="surface-page flex min-h-screen flex-col">
      <HomeHeader
        appName={siteConfig.name}
        navItems={navItems}
        brandHref={homeHref}
        activeHref={activeHref}
        navAriaLabel={primaryNavigationLabel}
        controls={getHeaderControlsCopy(locale)}
      />

      <main className="flex-1 px-4 pb-28 pt-28 text-stone-900 dark:text-stone-100 sm:px-6 sm:pt-32 md:pb-16 lg:px-10">
        <article className="mx-auto max-w-7xl py-2 sm:py-4">
          <RevealOnScroll className="surface-hero relative overflow-hidden rounded-[2rem] border border-stone-200/80 p-6 shadow-[0_24px_70px_rgba(28,25,23,0.08)] dark:border-stone-700/80 sm:p-8 lg:p-10">
            <p className="inline-flex rounded-full border border-amber-300/60 bg-amber-100/85 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-900 dark:border-amber-300/40 dark:bg-amber-300/10 dark:text-amber-200">
              {content.eyebrow}
            </p>
            <h1 className="mt-5 max-w-4xl text-3xl font-black leading-tight tracking-tight text-stone-950 [text-wrap:balance] dark:text-stone-50 sm:text-4xl lg:text-5xl">
              {content.h1}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-stone-700 dark:text-stone-200 sm:max-w-2xl sm:text-lg">
              {content.intro}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={localizeHref(content.cta.primaryHref, locale)}
                className="inline-flex items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-stone-50 shadow-[0_10px_26px_rgba(28,25,23,0.24)] transition hover:-translate-y-0.5 hover:bg-stone-800 dark:bg-amber-400 dark:text-stone-950 dark:shadow-[0_10px_26px_rgba(245,158,11,0.2)] dark:hover:bg-amber-300"
              >
                {content.cta.primaryLabel}
              </a>
              <a
                href={localizeHref(content.cta.secondaryHref, locale)}
                className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white/75 px-6 py-3 text-sm font-semibold text-stone-900 transition hover:-translate-y-0.5 hover:border-amber-600 hover:text-amber-800 dark:border-stone-500 dark:bg-stone-700/55 dark:text-stone-100 dark:hover:border-amber-300 dark:hover:text-amber-200"
              >
                {content.cta.secondaryLabel}
              </a>
            </div>
          </RevealOnScroll>

          <div className="mt-20 grid gap-6">
            {content.sections.map((section, index) => (
              <RevealOnScroll
                as="section"
                key={section.title}
                delayMs={90 + index * 70}
                className="bg-white/82 rounded-[1.5rem] border border-stone-200/85 p-6 shadow-[0_16px_34px_rgba(28,25,23,0.06)] dark:border-stone-700/75 dark:bg-stone-900/55 dark:shadow-[0_18px_40px_rgba(0,0,0,0.2)] sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-300/70 bg-amber-100/85 text-xs font-bold text-amber-900 dark:border-amber-300/40 dark:bg-amber-300/20 dark:text-amber-200">
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-stone-950 dark:text-stone-50">
                      {section.title}
                    </h2>
                    <div className="mt-4 space-y-4 text-base leading-8 text-stone-700 dark:text-stone-300">
                      {section.paragraphs.slice(0, 2).map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                      {section.paragraphs.length > 2 ? (
                        <details className="group pt-1">
                          <summary className="cursor-pointer list-none text-sm font-semibold text-amber-800 marker:content-none hover:text-amber-700 dark:text-amber-200 dark:hover:text-amber-100">
                            <span className="group-open:hidden">
                              {moreLabel}
                            </span>
                            <span className="hidden group-open:inline">
                              {lessLabel}
                            </span>
                          </summary>
                          <div className="mt-3 space-y-4">
                            {section.paragraphs.slice(2).map((paragraph) => (
                              <p key={paragraph}>{paragraph}</p>
                            ))}
                          </div>
                        </details>
                      ) : null}
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>

          <RevealOnScroll
            as="section"
            delayMs={140}
            className="surface-section-muted mt-20 rounded-[1.75rem] border border-stone-200/80 p-6 dark:border-stone-700/75 dark:bg-stone-900/35 sm:p-8"
          >
            <h2 className="text-2xl font-bold text-stone-950 dark:text-stone-50">
              {content.faqTitle}
            </h2>
            <div className="mt-5 divide-y divide-stone-200/80 dark:divide-stone-700/80">
              {content.faq.map((item) => (
                <details
                  key={item.question}
                  className="group py-4 first:pt-0 last:pb-0"
                >
                  <summary className="cursor-pointer list-none pr-6 text-base font-semibold text-stone-900 marker:content-none group-open:text-amber-800 dark:text-stone-50 dark:group-open:text-amber-200">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-stone-700 dark:text-stone-300">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </RevealOnScroll>

          <RevealOnScroll
            as="section"
            delayMs={180}
            className="bg-white/78 mt-16 rounded-[1.5rem] border border-stone-200/85 p-6 dark:border-stone-700/75 dark:bg-stone-900/45 sm:p-7"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-200">
              {content.related.label}
            </p>
            <a
              href={localizeHref(content.related.href, locale)}
              className="mt-3 inline-flex text-base font-bold text-amber-900 underline decoration-amber-500 underline-offset-4 transition hover:text-amber-700 dark:text-amber-100 dark:hover:text-amber-200"
            >
              {content.related.pageLabel}
            </a>
          </RevealOnScroll>

          <RevealOnScroll
            delayMs={220}
            className="mt-12 border-t border-stone-200/80 pt-8 dark:border-stone-700"
          >
            <a
              href={localizedHomeLinkHref}
              className="text-sm font-semibold text-amber-700 transition hover:text-amber-600 dark:text-amber-300 dark:hover:text-amber-200"
            >
              {content.backToHome}
            </a>
          </RevealOnScroll>
        </article>
      </main>

      <HomeFooter
        note={legalT('footerNote')}
        imprintLabel={legalT('imprint.title')}
        privacyLabel={legalT('privacy.title')}
        imprintHref={localizeHref('/impressum', locale)}
        privacyHref={localizeHref('/datenschutz', locale)}
      />
    </div>
  );
}
