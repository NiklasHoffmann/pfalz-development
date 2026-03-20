import { HomeAudienceSection } from './HomeAudienceSection';
import { HomeContactSection } from './HomeContactSection';
import { HomeFooter } from './HomeFooter';
import { HomeHeader } from './HomeHeader';
import { HomeHeroSection } from './HomeHeroSection';
import { HomeMobileDock } from './HomeMobileDock';
import { HomePackagesSection } from './HomePackagesSection';
import { HomeProcessFaqSection } from './HomeProcessFaqSection';
import { HomeScrollOffsetSync } from './HomeScrollOffsetSync';
import { HomeServicesSection } from './HomeServicesSection';
import type { HomePageData } from './types';

interface HomePageViewProps {
  data: HomePageData;
}

export function HomePageView({ data }: HomePageViewProps) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        {data.accessibility.skipToContentLabel}
      </a>
      <main
        id="main-content"
        className="surface-page min-h-screen overflow-x-clip pb-24 md:pb-0"
      >
        <HomeScrollOffsetSync />
        <HomeHeader appName={data.appName} navItems={data.navItems} />
        <HomeMobileDock items={data.mobileNavItems} />
        <HomeHeroSection
          eyebrow={data.hero.eyebrow}
          headline={data.hero.headline}
          subheadline={data.hero.subheadline}
          primaryCta={data.hero.primaryCta}
          secondaryCta={data.hero.secondaryCta}
          trustTitle={data.hero.trustTitle}
          trustItems={data.hero.trustItems}
        />
        <HomeServicesSection
          title={data.services.title}
          items={data.services.items}
        />
        <HomeAudienceSection
          audiencesTitle={data.audiences.title}
          audiences={data.audiences.items}
          whyMeTitle={data.whyMe.title}
          whyMeItems={data.whyMe.items}
        />
        <HomePackagesSection
          title={data.packages.title}
          note={data.packages.note}
          detailsCta={data.packages.detailsCta}
          modalIncludesTitle={data.packages.modalIncludesTitle}
          items={data.packages.items}
        />
        <HomeProcessFaqSection
          processTitle={data.process.title}
          processSteps={data.process.steps}
          faqTitle={data.faq.title}
          faqItems={data.faq.items}
        />
        <HomeContactSection
          navLabel={data.contact.navLabel}
          title={data.contact.title}
          description={data.contact.description}
          primaryCta={data.contact.primaryCta}
          secondaryCta={data.contact.secondaryCta}
          details={data.contact.details}
        />
        <HomeFooter
          note={data.footer.note}
          imprintLabel={data.footer.imprintLabel}
          privacyLabel={data.footer.privacyLabel}
        />
      </main>
    </>
  );
}
