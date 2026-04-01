import { Link } from '@/routing';
import { HomeFooter } from '@/components/home/HomeFooter';
import { HomeHeader } from '@/components/home/HomeHeader';
import type { NavItem } from '@/components/home/types';
import type { SeoPageContent } from '@/content/seo/types';
import { siteConfig } from '@/config/site';
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
  const basePath = locale === 'de' ? '' : `/${locale}`;
  const homeHref = basePath || '/';
  const homeLinkHref = '/';
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
  if (activeNav === 'service')
    activeHref = `${basePath}/leistungen`;
  if (activeNav === 'industry') {
    activeHref = `${basePath}/branchen`;
  }
  if (activeNav === 'contact') activeHref = `${homeHref}#kontakt`;

  return (
    <div className="flex min-h-screen flex-col">
      <HomeHeader
        appName={siteConfig.name}
        navItems={navItems}
        brandHref={homeHref}
        activeHref={activeHref}
      />

      <main className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_top_left,#fffbeb_0%,#f5f5f4_42%,#e7e5e4_100%)] px-5 pb-14 pt-28 text-stone-900 dark:bg-[radial-gradient(circle_at_top_left,#3a2f28_0%,#332b26_44%,#24303d_100%)] dark:text-stone-100 sm:px-8 sm:pt-32 lg:px-10">
        <div className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-amber-300/30 blur-3xl dark:bg-amber-400/24" />
        <div className="pointer-events-none absolute -right-12 top-40 h-64 w-64 rounded-full bg-stone-300/45 blur-3xl dark:bg-stone-300/18" />

        <article className="relative mx-auto max-w-5xl py-2 sm:py-4">
          <div className="rounded-[1.75rem] border border-stone-200/70 bg-[linear-gradient(120deg,rgba(255,251,235,0.95),rgba(255,255,255,0.88),rgba(250,245,235,0.92))] p-6 shadow-[0_20px_56px_rgba(28,25,23,0.14)] dark:border-stone-500/70 dark:bg-[linear-gradient(120deg,rgba(72,61,54,0.9),rgba(50,43,38,0.88),rgba(39,53,68,0.86))] dark:shadow-[0_24px_64px_rgba(0,0,0,0.26)] sm:p-8 lg:p-10">
            <p className="inline-flex rounded-full border border-amber-300/60 bg-amber-100/85 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-900 dark:border-amber-300/40 dark:bg-amber-300/10 dark:text-amber-200">
              {content.eyebrow}
            </p>
            <h1 className="mt-5 max-w-4xl text-3xl font-black leading-tight tracking-tight [text-wrap:balance] text-stone-950 dark:text-stone-50 sm:text-4xl lg:text-5xl">
              {content.h1}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-stone-700 dark:text-stone-200 sm:max-w-2xl sm:text-lg">
              {content.intro}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={content.cta.primaryHref}
                className="inline-flex items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-stone-50 shadow-[0_10px_26px_rgba(28,25,23,0.24)] transition hover:-translate-y-0.5 hover:bg-stone-800 dark:bg-amber-400 dark:text-stone-950 dark:shadow-[0_10px_26px_rgba(245,158,11,0.2)] dark:hover:bg-amber-300"
              >
                {content.cta.primaryLabel}
              </Link>
              <Link
                href={content.cta.secondaryHref}
                className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white/75 px-6 py-3 text-sm font-semibold text-stone-900 transition hover:-translate-y-0.5 hover:border-amber-600 hover:text-amber-800 dark:border-stone-500 dark:bg-stone-700/55 dark:text-stone-100 dark:hover:border-amber-300 dark:hover:text-amber-200"
              >
                {content.cta.secondaryLabel}
              </Link>
            </div>
          </div>

          <div className="mt-12 divide-y divide-stone-200/75 border-y border-stone-200/75 dark:divide-stone-700/80 dark:border-stone-700/80">
            {content.sections.map((section, index) => (
              <section
                key={section.title}
                className="py-7 first:pt-8 last:pb-8 sm:py-8"
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
                            <span className="group-open:hidden">{moreLabel}</span>
                            <span className="hidden group-open:inline">{lessLabel}</span>
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
              </section>
            ))}
          </div>

          <section className="mt-12 rounded-2xl border border-stone-200/80 bg-stone-50/85 p-6 dark:border-stone-500/70 dark:bg-stone-700/45 sm:p-7">
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
          </section>

          <section className="mt-10 border-l-4 border-amber-400/70 pl-4 sm:pl-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-200">
              {content.related.label}
            </p>
            <Link
              href={content.related.href}
              className="mt-2 inline-flex text-base font-bold text-amber-900 underline decoration-amber-500 underline-offset-4 transition hover:text-amber-700 dark:text-amber-100 dark:hover:text-amber-200"
            >
              {content.related.pageLabel}
            </Link>
          </section>

          <div className="mt-10 border-t border-stone-200/80 pt-6 dark:border-stone-700">
            <Link
              href={homeLinkHref}
              className="text-sm font-semibold text-amber-700 transition hover:text-amber-600 dark:text-amber-300 dark:hover:text-amber-200"
            >
              {content.backToHome}
            </Link>
          </div>
        </article>
      </main>

      <HomeFooter
        note={legalT('footerNote')}
        imprintLabel={legalT('imprint.title')}
        privacyLabel={legalT('privacy.title')}
      />
    </div>
  );
}
